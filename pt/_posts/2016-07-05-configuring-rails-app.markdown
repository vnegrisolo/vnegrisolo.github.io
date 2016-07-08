---
layout: post
locale: pt
title:  "Configurando uma Aplicação Rails"
date:   2016-07-05 17:00:00 -0300
categories: rails ruby
---

Há muito a se considerar quando configurar uma aplicação Rails, tais como **organização das variáveis**, **ambientes**, **credenciais de segurança**, etc. Dentre tantas formas diferentes de se fazer isso vou mostrar a minha preferida usando o que o Rails nos oferece com `config_for`.

### Organização

Rails tem um método para carregar um arquivo de configuração muito simples de ser usado: [config_for](http://api.rubyonrails.org/classes/Rails/Application.html#method-i-config_for):

```ruby
module MyRailsApp
  class Application < Rails::Application
    config.github = config_for(:github)
  end
end
```

Desta forma não há necessidade em se manter apenas um arquivo `application.yml` de configuração com **tudo** que a aplicação precisa. Por isso eu agrupo as configurações por alguma **dependência externa**, ou **assunto específico** da aplicação.

### Formato

Em resumo, meu formato preferido é `yml` como neste exemplo:

```yml
# config/github.yml
development: &development
  api_url: 'https://api.github.com'
  client_id: 'my-public-client-id'
  client_secret: <%= ENV['GITHUB_CLIENT_SECRET'] %>

test:
  <<: *development

staging:
  <<: *development
  client_id: 'my-public-sandbox-client-id'

production:
  <<: *development
```

### Ambientes

No exemplo o arquivo de configuração `config/github.yml` usa os **ambientes** como **chave raiz**. Assim os valores padrão são definidos na chave `development` e todos os ambientes **herdam** de `development`. Ainda podemos redefinir valores específicos para um determinado ambiente, como no caso em `client_id` para *staging*.

Localmente os desenvolvedores do projeto deveriam adotar um mesmo padrão de configuração como *url/user/pass*. Porém se isso não for possível por algum motivo eu buscaria o valor e manteria um valor default, como por exemplo:

```yml
database:
  user: <%= ENV['DB_USER'] || 'admin' %>
```

### Credenciais

A principal premissa é **nunca públicar** uma credencial por motivos óbvios de segurança. Por isso usa-se **variáveis de ambiente** e assim esse tipo de configuração vai para o painel de configuração no *Heroku* ou então para um arquivo `/etc/environment`.

Localmente eu gosto de usar a gem [dotenv](https://github.com/bkeepers/dotenv) sempre tomando o cuidado de nunca versionar uma chave privada. Geralmente eu instalo `dotenv` desta forma:

```shell
echo "gem 'dotenv-rails', groups: [:development, :test]" >> Gemfile;
bundle;
touch .env{,.sample};
echo ".env" >> .gitignore;
```

### Uso das Configurações

Para usar as configurações basta acessar `Rails.configuration`:

```ruby
url = Rails.configuration.github['api_url']
```

### Conclusão

O uso do método `config_for` do Rails facilita a organização das configurações de uma aplicação. Assim todas as variáveis ficam contidas em arquivos específicos e nunca mais uma variável de ambiente será usada dentro do código.

Somando-se a isso, o uso de `.env.sample` e a gem **dotenv** ajuda muito a um novo desenvolvedor descobrir o que ele precisa configurar localmente para começar a trabalhar no projeto.

Finalmente podemos descartar a adição de mais dependências ao projeto como [figaro](https://github.com/laserlemon/figaro) ou [settingslogic](https://github.com/settingslogic/settingslogic) que tentam resolver estes mesmos problemas e assim deixar o projeto mais enxuto.
