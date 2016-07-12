---
layout: post
locale: en
title:  "Configuring a Rails Application"
date:   2016-07-05 17:00:00 -0300
categories: rails
---

There are a lot to consider when configuring a Rails application, such as **variables organization**, **environments**, **security credentials**, etc. Among so many different ways to do that I'm going to show my prefered way using what Rails has to offer with `config_for`.

### Organization

Rails has a helper method to load a configuration file and it's very easy to use it: [config_for](http://api.rubyonrails.org/classes/Rails/Application.html#method-i-config_for):

```ruby
# config/application.rb
module MyRailsApp
  class Application < Rails::Application
    config.github = config_for(:github)
  end
end
```

This way there's no need to keep just one `application.yml` configuration file with **all** that the application needs. That's why I group configurations by some **external dependency** or by some **specific subject**.

### Format

In short, my prefered format is `yml`, such as in this example:

```yml
# config/github.yml
development: &development
  api_url: https://api.github.com
  client_id: my-public-client-id
  client_secret: <%= ENV['GITHUB_CLIENT_SECRET'] %>

test:
  <<: *development

staging:
  <<: *development
  client_id: my-public-sandbox-client-id

production:
  <<: *development
```

### Environments

In that example the configuration file `config/github.yml` use the **environments** as **root keys**. This way the default values are set in the `development` key and all environments **inherit** from `development`. Also we can redefine environment specific values as, in this case, `client_id` for *staging*.

Locally the project developers should adopt a common pattern of configuration as *url/user/pass*. However if this is not an option by any reason I would fetch the value with a default one, such as:

```yml
database:
  user: <%= ENV['DB_USER'] || 'admin' %>
```

### Credentials

The main goal is to **never publish** a credential by obviously security reasons. That's why we use **environment variables** and then this kind of configuration goes to *Heroku* dashboard or inside `/etc/environment` file.

Locally I like to use the gem [dotenv](https://github.com/bkeepers/dotenv) always taking care to never commit a private secret. I usually install `dotenv` this way:

```shell
echo "gem 'dotenv-rails', groups: [:development, :test]" >> Gemfile;
bundle;
touch .env{,.sample};
echo ".env" >> .gitignore;
```

### Configurations Usage

In order to use the configurations you just access `Rails.configuration`:

```ruby
url = Rails.configuration.github['api_url']
```

### Conclusion

The usage of Rails `config_for` simplifies the organization of application configuration. Then all variables are hold into specific files and you never will use an environment variable inside the code anymore.

Additionally, the usage of `.env.sample` and the gem **dotenv** helps a new developer to find out what's needed to configure locally for starting to work on the project.

Finally we can discard to add more dependencies to the project such as [figaro](https://github.com/laserlemon/figaro) or [settingslogic](https://github.com/settingslogic/settingslogic) because they just try to solve the same problems and then let the project with less dependencies.
