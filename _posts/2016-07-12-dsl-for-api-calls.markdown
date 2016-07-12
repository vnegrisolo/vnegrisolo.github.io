---
layout: post
locale: en
title:  "DSL for API calls"
date:   2016-07-12 17:00:00 -0300
categories: rails
---

My goal is to encapsulate a API with service classes using a DSL similar to `ActiveRecord`. This way we can use methods like `where`, `find_by`, etc. In order to achieve that I created a class to abstract a **json API** using the gem **faraday** and the result is very cool.

### Motivation

The [gem faraday](https://github.com/lostisland/faraday) is well known and used by Ruby on Rails community. However, for every request it's necessary to define **all parameters again**. I would like to use default values and override them if needed.

The DSL offered by the gem `faraday` it's a little bit inconsistent. Some `request` attributes are defined via **regular** methods and other via **setters** methods, such as in the folllowing example:

```ruby
request.url path
request.params = query
```

Another reason is the API implementation abstraction using a **well known DSL** by Rails developers, like `ActiveRecord`.

### DSL - Domain Specific Language

My **intention** was to create a service class where I could use it this way:

```ruby
user = Github::UserService.find_by(access_token: 'my-access-token')
```

So I started creating the class `Api`.

### `Api` Class

The `Api` Class represents an instance of a flexible **json API**.

Its instance reuses the same `Faraday connection` instance by memoizing.

Also it defines default values for:

- `timeout`
- `open_timeout`
- `headers['Accept']`
- `headers['Content-Type']`

Another important point was the API abstraction that now receives **keyword arguments**. This allows a cleaner and more explicitly interface than the one offered by `faraday`.

```ruby
# path: app/services/api.rb
class Api
  def initialize(url:, timeout: 5, open_timeout: 2)
    @url = url
    @timeout = timeout
    @open_timeout = open_timeout
  end

  def get(path:, query: nil, headers: {})
    request = request(path, query: query, headers: headers)
    ApiResponse.new(connection.get(&request))
  end

  def post(path:, body: nil, headers: {})
    request = request(path, body: body, headers: headers)
    ApiResponse.new(connection.post(&request))
  end

  def put(path:, body: nil, headers: {})
    request = request(path, body: body, headers: headers)
    ApiResponse.new(connection.put(&request))
  end

  def patch(path:, body: nil, headers: {})
    request = request(path, body: body, headers: headers)
    ApiResponse.new(connection.patch(&request))
  end

  def delete(path:, headers: {})
    request = request(path, headers: headers)
    ApiResponse.new(connection.delete(&request))
  end

  private

  def request(path, query: nil, body: nil, headers: {})
    lambda do |request|
      request.url path
      request.params = query if query
      request.body = body.to_json if body
      request.headers['Accept'] = 'application/json'
      request.headers['Content-Type'] = 'application/json'
      headers.each { |header, value| request.headers[header] = value }
      request.options.timeout = @timeout
      request.options.open_timeout = @open_timeout
    end
  end

  def connection
    @connection ||= Faraday.new(url: @url) do |faraday|
      faraday.request :url_encoded
      faraday.adapter Faraday.default_adapter
    end
  end
end
```

### `ApiResponse` Class

Every API response is encapsulated by `ApiResponse`.

Its main goal is to parse the **json** response.

```ruby
# path: app/services/api_response.rb
class ApiResponse
  attr_reader :response

  def initialize(raw_response)
    @response = JSON.parse(raw_response.body)

    if @response.is_a?(Hash) && @response['error']
      raise Api::Error.new(@response)
    end
  end
end
```

### `ApiError` Class

Another responsability of `ApiResponse` class is to raise an `ApiError` in case of the API returns any error in its content.

This treatment could be via **content** or via **http code**, etc.

```ruby
# path: app/services/api_error.rb
class ApiError < StandardError
  attr_reader :response

  def initialize(response)
    @response = response
  end
end
```

### `Github::UserService` Service Class

Finally, the Service Class has as its main goal to create a DSL similar to `ActiveRecord` and then abstract the API complexity.

```ruby
# path: app/services/github/user_service.rb
module Github::UserService
  extend self

  def find_by(access_token:)
    api.get(
      path: 'user',
      headers: { 'Authorization' => "token #{access_token}" }
    )
  end

  private

  def api
    @api ||= Api.new(url: Rails.configuration.github['api_url'])
  end
end
```

I'm using the Rails method `config_for` for defining the configuration. I wrote about that on: [Configurando uma Aplicação Rails]({{site.url}}/rails/configuring-rails-app).

### Conclusion

A `Api` Class allowed us the reuse of well spread patterns into Rails community, such as **convention over configuration**, **ActiveRecord pattern**, **using Hashes over json Strings**, **error treatment**, etc.

All these brings more agility on application development and maintenance, because new developers understand the project faster.
