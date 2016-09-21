---
layout: post
title:  "First Ember JS Application"
date:   2016-07-26 12:00:00
last_modified_at: 2016-07-26 12:00:00
categories: ember
image: /images/coffee-1800x400.jpg
---
**Ember JS** is a Javascript framework for ambitious Web Applications. This means that you can build **great applications**, with tons of **user interactions** in a very **efficient** way. In this post I'll tell how to create a simple EmberJS Web Application.

## Install Ember

[Ember][ember] uses NodeJs and its [npm] (node package manager) to manage some of dependencies, including Ember itself.

It also depends on [bower] to be installed. So make sure you have all of them installed initially:

```shell
node -v
# => v6.2.0
npm -v
# => 3.9.0
bower -v
# => 1.7.9
```

Then install the last release version of Ember, in this case `2.7`:

```shell
npm install -g ember-cli@2.7
ember -v
# => ember-cli: 2.7.0
# => node: 6.2.0
# => os: darwin x64
```

## Create an Ember project

For creating an Ember project with the name `quickstart`:

```shell
ember new quickstart
cd quickstart
ember server
```

This will create the project, access the project folder and then start Ember server. You can see your app at `http://localhost:4200/`.

## Ember Concepts

The main goal when building an Ember app is to understand the user interface you want to build. In a uri perspective, all folder structure represents a nested resource. Ember uses that to organize **Routes** and **Templates**. Here it is a simple description of Ember Classes:

The **Router** receives a hit from the user and dispatches to a specific **Route**. There is just one Router per application and is stored in `app/router.js`.

In a specific **Route** you can fetch data from the server based on uri and query params and then it's controller is called.

A **Controller** can do the same as the Route and it's being discontinued by the Ember community, so please **don't use Controllers**. You can just ignore them when creating a new app, but if you are working in a legacy Ember app you need to know that Controllers in Ember are **Singletons**. So it will keep a state in it. This could cause some weird behavior or bugs.

Finally a **Template** related to its Route is called and rendered using [handlebars] for basic conditionals, loops and variable outputs.

As I said **Routes** and **Templates** are related to the uri, but sometimes there are some logic and templates that could be reused. To do that you might need to use a **Component**. A **Component** can have both a component class to fetch some data from the server and also it's template. **Components** are not stick to the uri.

![ember-core]

## Generating some code

The easiest and fastest way to create your code in Ember is to use ember-cli generators. Run the following to know all generators available:

```shell
ember help generate
```

Let's start generating a route `hello` with:

```shell
ember generate route hello
# => installing route
# =>   create app/routes/hello.js
# =>   create app/templates/hello.hbs
# => updating router
# =>   add route hello
# => installing route-test
# =>   create tests/unit/routes/hello-test.js
```

Add a model that just return a string:

{: data-path="app/routes/hello.js"}
```javascript
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return 'World';
  }
});
```

Finally show it in the template:

{% raw %}
{: data-path="app/templates/hello.hbs"}
```handlebars
<div class="greeting">Hello {{model}}!</div>
```
{% endraw %}

Go to `http://localhost:4200/hello` and check you first Ember Route and Template.

## Testing your App

Let's create an **Acceptance Test** in order to test the app in the User's perspective:

```shell
ember generate acceptance-test hello
# => installing acceptance-test
# =>   create tests/acceptance/hello-test.js
```

This is a simple and straightforward test that verifies the **current url** and the **content** produced when the user hits `/hello` page:

{: data-path="tests/acceptance/hello-test.js"}
```javascript
import { test } from 'qunit';
import moduleForAcceptance from 'ember-quickstart/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | hello');

test('visiting /hello', function(assert) {
  assert.expect(2);
  visit('/hello');
  console.log(find('.greeting').text());

  andThen(function() {
    assert.equal(currentURL(), '/hello');
    assert.equal(find('.greeting').text(), 'Hello World!');
  });
});
```

It's time to check if your tests are passing at `http://localhost:4200/tests`

## Conclusion

Ember is a powerful Javascript framework and yet very simple to start and maintain. A good way to start is to get used with the **core concepts** of Ember. Also use Ember **generators** and other **ember-cli tools** to gain speed on development and use **tests** as the best friend you can have when coding. You'll find yourself as an Ember developer in a blink. Good luck!

[ember]:      http://emberjs.com/
[npm]:        https://www.npmjs.com/
[bower]:      https://bower.io/
[handlebars]: http://handlebarsjs.com/
[ember-core]: /images/posts/ember-core-concepts.png
{: .img-responsive width="90%"}
