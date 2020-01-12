---
layout: post
title:  "Docker for all environments"
date:   2017-09-30 12:00:00
last_modified_at: 2017-09-30 12:00:00
categories: Docker
tags: Rails
---

Should we use Docker 🐳 for local development ❓? It seems easy to argue to not use it, just use local and that's it. But it's also easy to find cases where the convenience of Docker play a big role on a daily basis job. In case you want to consider it for any reason you have it read this post and have fun.

## Some context

Docker 🐳 is a great tool for packaging your application and its requirements. You can automate every step to automate it's creation including packages to install, environment variable, manipulating files, running commands, etc. For all these reasons a lot of companies are adopting it on 🚀 production.

On the other hand in order to develop and test a single application sometimes it's needed to run several other ones. Also application may need some dependencies like key-value store, caching, databases, search engines, messaging services and so on. For modern and well constructed applications this might not be a big problem, but for legacy ones this scenario is a 😱 nightmare.

**Unfortunately** there are innumerous reasons for not running an application locally so let's face it and use all the convenience of Docker for your development mode as well.

To reinforce my opinion, for a **faster** and **better** development we **should always run applications on local** host machine. You usually have more control, it's easily debug it, etc. Anyway, this post is about when this is not possible.

## The approach

I'll use as an example a simple Ruby on Rails application to show how to configure docker on both **development** and **production** environments. You can port the same ideas to your own codebase. By the file names you will see that I chose **development** to be my default environment.

## Dockerfile

So let's start with the `Dockerfile` that's used to build Docker images.

{: class="two-column"}
{: data-path="Dockerfile"}
```docker
FROM ruby:2.4.1-alpine3.6
WORKDIR /app

RUN apk --no-cache add \
    build-base \
    nodejs nodejs-npm \
    postgresql-dev

COPY bin/wait-for /usr/local/bin/

RUN gem install bundler
RUN bundle config --global jobs 4
RUN bundle config --global retry 3

COPY Gemfile* /app/
# rails default to RAILS_ENV=development
RUN bundle install

# docker volume instead
# assets:precompile is useless in dev
```

{: class="two-column"}
{: data-path="Dockerfile.prod"}
```docker
FROM ruby:2.4.1-alpine3.6
WORKDIR /app

RUN apk --no-cache add \
    build-base \
    nodejs nodejs-npm \
    postgresql-dev

COPY bin/wait-for /usr/local/bin/

RUN gem install bundler
RUN bundle config --global jobs 4
RUN bundle config --global retry 3

COPY Gemfile* /app/
ENV RAILS_ENV=production
RUN bundle install --without development test

COPY . /app/
RUN bundle exec rails assets:precompile
```

The idea behind this code snippets is to show that we want to make the images as similar as it possible, but let's face it, there are differences. In this case **library dependencies** will change. Another difference is on extra steps for production such as precompiling assets. But it could be more than that.

In **production** mode I am copying all files from the application (except the ignored ones) into `/app` folder. I don't do that in **development** mode because I want to override it with files I have it on my host machine. In this case I can change them and this will be automatically read by the running container.

## Compose the enviroment

Here it comes my `docker-compose.yml` files:

{: class="two-column"}
{: data-path="docker-compose.yml"}
```yml
---
version: "3"
services:
  web_dev:
    build: .
    volumes:
      - "$PWD:/app"
    command: >
      sh -c 'wait-for pg_dev:5432 &&
             bundle exec rails server'
    expose: ["3000"]
    ports: ["3000:3000"]
    depends_on: ["pg_dev"]

  pg_dev:
    image: postgres
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: postgres
```

{: class="two-column"}
{: data-path="docker-compose.prod.yml"}
```yml
---
version: "3"
services:
  web_prod:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: >
      sh -c 'wait-for pg_prod:5432 &&
             bundle exec rails server'
    expose: ["3000"]
    ports: ["3000:3000"]
    depends_on: ["pg_prod"]
    env_file: [".env.prod"]

  pg_prod:
    image: postgres
    ports: ["5432:5432"]
    env_file: [".env.prod"]
```

First thing is the explicit usage of a suffix `_dev` or `_prod`. I'm still not convinced that this is great, but so far that's not clear to me I preferred to have docker service names very explicitly so I can avoid bad usage of environments. It might be very dangerous to try destroy a **development** database and ends up destroying a **production** one.

A difference to be highlighted is the usage of `volume` entry on **development** mode. As I mentioned before, as soon as a developer change the code it will be reflected inside the web_dev container.

The way that we deal with environment variables will change as well. In this case for **production** I am loading these values from a file that's ignored from my git repo. I am pretty sure that this is not the best solution but that's also not the scope of this post.

Read my blog post about [Wait for Docker container][wait-docker] to understand how to do that if you want.

Finally you may want to reuse part of this yml configuration, so take a look into [docker-compose override files][dk-compose-override]. This might be a good solution for big projects with extensive configurations.

## Ignore files

It's nice to reinforce that `git` and `docker` have its ignore files for different purposes. This is how I set my ignore files to work:

{: class="two-column"}
{: data-path=".gitignore"}
```
.bundle/
.env.prod
log/
tmp/
```

{: class="two-column"}
{: data-path=".dockerignore"}
```
.bundle/
.dockerignore
.git/
.gitignore
Dockerfile*
docker-compose*
log/
public/assets/
tmp/
```

## Environment variable file

Finally a simple `.env.prod`:

{: data-path=".env.prod"}
```
POSTGRES_PASSWORD=postgres123
RAILS_SERVE_STATIC_FILES=true
SECRET_KEY_BASE=123abc
```

Remember this is just used by **production** environment and this is ignored by `git`.

## Running containers

With all that set here I have some **example commands** to test both environments:

{: class="two-column"}
```shell
alias dc="docker-compose"

dc up --build -d
dc logs -f

dc run web_dev bundle exec rubocop
dc run web_dev bundle exec rails db:migrate
dc run web_dev bundle exec rspec
dc run -it web_dev bundle exec rails console

dc down
```

{: class="two-column"}
```shell
alias dc="docker-compose -f docker-compose.prod.yml"

dc up --build -d
dc logs -f

dc run web_prod bundle exec rails db:create
dc run web_prod bundle exec rails db:migrate
dc run web_prod bundle exec rake app:calculate
dc run -it web_prod sh

dc down
```

These are just a sample of how to interact with our containers using `docker-compose`. Notice that I created an `alias` just for simplifying 😉 that code snippet, but the real change is on loading the default `docker-compose.yml` file or setting it to `-f docker-compose.prod.yml`.

## Conclusion

Docker may help us to work on 💩 brown-field projects. Or you just don't want to install a lot of applications to start with right? In one case or the other I hope you have enjoyed 👍 this reading.

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}

[wait-docker]: {% post_url /docker/2017-09-19-wait-for-docker-container %}
