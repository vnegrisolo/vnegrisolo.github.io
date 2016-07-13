---
layout: post
locale: pt
title:  "DSL para Chamadas via API"
date:   2016-07-12 17:00:00 -0300
categories: rails
---

Meu objetivo é encapsular uma API com classes de Serviço utilizando uma DSL próxima ao `ActiveRecord`. Assim podemos usar métodos como `where`, `find_by`, etc. Para isso criei uma classe que abstrai uma **API json** usando a gem **faraday** e o resultado ficou muito legal.

### Motivação

A [gem faraday](https://github.com/lostisland/faraday) é muito conhecida e utilizada pela comunidade de Ruby on Rails. Contudo, para cada requisição é necessário de se definir **todos os parâmetros novamente**. Eu gostaria de usar valores-padrão e quando necessário sobrescrevê-los.

A DSL oferecida pela gem `faraday` é um pouco inconsistente. Alguns atributos de uma `request` são definidos via métodos **comuns** e outros via métodos **setters**, como no exemplo a seguir:

```ruby
request.url path
request.params = query
```

Outro motivo é a abstração da implementação da API usando uma **DSL mais conhecida** por desenvolvedores Rails, como o `ActiveRecord`.

### DSL - Domain Specific Language

A minha **intenção** era criar uma classe de serviço onde eu pudesse usá-la da seguinte forma:

```ruby
user = Github::UserService.find_by(access_token: 'my-access-token')
```

Para isso eu começei criando a classe `Api`.

### Classe `Api`

A Classe `Api` representa uma instância de **API json** flexível.

Uma instância da mesma reutiliza a mesma instância do `Faraday connection` por memoização.

Além disso defini valores-padrão para:

- `timeout`
- `open_timeout`
- `headers['Accept']`
- `headers['Content-Type']`

Outro ponto importante foi a abstração da API que agora recebe **keyword arguments** permitindo uma interface muito mais limpa e explícita do que a oferecida via `faraday`.

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

### Classe `ApiResponse`

A resposta de cada request de API é encapsulada via `ApiResponse`.

A principal função desta classe é parsear a resposta **json**.

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

### Classe `ApiError`

Outra função da classe `ApiResponse` é lançar um `ApiError` caso a API retorne algum erro no conteúdo da resposta.

Esse tratamento pode ser via **conteúdo da resposta**, ou **código http**, etc.

```ruby
# path: app/services/api_error.rb
class ApiError < StandardError
  attr_reader :response

  def initialize(response)
    @response = response
  end
end
```

### Classe de Serviço `Github::UserService`

Finalmente, a Classe de Serviço tem como objetivo principal criar uma DSL semelhante ao `ActiveRecord` e assim abstrair a complexidade da API.

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

Estou usando o método do Rails `config_for` para definir a configuração usada. Eu escrevi sobre isso em: [Configurando uma Aplicação Rails]({{ '/rails/configuring-rails-app' | i18n_url }}).

### Conclusão

A Classe `Api` permitiu o re-uso de padrões já difundidos na comunidade Rails, como por exemplo **convenção sobre configuração**, **o padrão ActiveRecord**, **o uso de Hashes sobre json Strings**, **tratamento de erros**, etc.

Tudo isso traz mais agilidade no desenvolvimento e manutenção de aplicações, uma vez que desenvolvedores novos conseguem entender o projeto mais rapidamente.
