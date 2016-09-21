---
layout: post
title:  "Why Ember JS"
date:   2016-07-27 12:00:00
last_modified_at: 2016-07-27 12:00:00
categories: ember
image: /images/sunset-1800x400.jpg
---
Ember is a **light**, **flexible**, **efficient** and **very powerful** javascript framework for very **Ambitious** web applications. In this post I write about the greatness of Ember, why I like it, some myths and also its problems. This is an opinionated post.

## Convention over Configuration

Ember was built with an amazing concept, strongly implemented in the Rails community: **Convention over Configuration**. This means that there are some patterns to follow that the application relies on. These patterns are so well spread that developers move from projects and start to produce very fast.

## Ember Tooling

To start with let's start with tooling. Ember comes with `ember-cli` that is a **command line toolset** for Ember. With `ember-cli` your project a lot of integrations for free.

The first integration is with a very fast **asset pipeline**: [Broccoli][broccoli]. So if you want to use coffee script or another technology that requires some task on the build step you can do that with Broccoli.

Another built-in integration is with [Babel][babel]. Babel is responsible to transform the new javascript generation to the one that are supported by browsers. That's why we can use `ES2015` javascript version in Ember projects.

Ember also uses `npm` for managing javascript dependencies used for **building steps** dependencies.

Ember comes with another javascript dependencies manager: `bower`. However `bower` is used for **front-end** dependencies.

There's a really good web site that compared Ember dependencies and provides a score. Check it out [Ember Observer][ember-observer].

The last great point of tooling is **generators**. Ember comes with a lot of code generators. You can check it out with `help` command:

```shell
ember help generate
```

## Router => The Best of Ember

The Ember **Router** is responsible for handling the current URL and map it to one or more **Route**. It uses the basic concept of nested resources that URL give to us through its folder structure and all **Routes** and **Templates** follow the same structure. The code becomes well segmented by the uri structure. Also developers know exactly which file the code will be. Here's an example:

{: data-path="app/router.js"}
```javascript
Router.map(function() {
  this.route("photo", { path: "photo/:id" }, function() {
    this.route("comment", { path: "comment/:id" });
  });
});
```

Ember changes the url in the browser for every transition and it does that using HTML5 `pushstate`. This way when the user clicks a link handled by Ember, the **content** will change, the **url** will change, the url will be part of the browser **history**. All of this **without a full page refresh**.

Additionally to that Ember will load correctly all the application when a full page refresh is required by the user, or when it shares a url with other user. So it's kind of having the benefits os a regular server application, but all made in the browser, just hitting the user to get data through ajax.

## Json API Adapter => ember-data

As I said before data communication between browser and server is made by Ajax calls through `ember-data`. It's a kind of ORM (object-relational mapping) over HTTP. It's built in with Ember Applications already so you don't need to install it or configure it to start to use.

`ember-data` relies on Ember models and it provides a robust way of serializing, persisting and deserializing it to the chosen repository. It comes with `JSONAPIAdapter` and `RESTAdapt` and it can be customized.

Following a convention like **JsonAPI** is good start point for modeling data between client and server.

Developers just need to work with models. Serialization is handled by the framework. This is a really big deal. Let's worry with stuff that matters for the product.

## Myth: Ember is used just for SPA => **False**

SPA stands for **Single Page Application** and it means that all necessary code (HTML, Javascript, CSS) will be loaded at once in a single page load. After that the flow is controlled by the Javascript, in this case by Ember. And then Ember exchange data with the server using Ajax calls.

This myth is based on the default way of Ember to work. Without any configuration Ember will append it's controls to `body` of the html response and then take care about the user flow. So if you have a legacy application and wants to add a small Ember piece of code you can [configure] your app to just take care of an specific element instead of `body`:

{: data-path="app/app.js"}
```javascript
export default Ember.Application.extend({
  rootElement: '#app'
});
```

This way you can have more than one Ember App per page and other javascript frameworks working together.

You may need to prevent url changes by Ember:

{: data-path="config/environment.js"}
```javascript
var ENV = {
  locationType: 'none'
};
```

Finally you can restrict Ember to handle specific uri:

{: data-path="app/router.js"}
```javascript
Ember.Router.extend({
  rootURL: '/blog/'
});
```

## Testing

Ember uses [QUnit][qunit] for tests. I wrote a very simple acceptance test [First Ember JS Application][first-ember-app] and you can see the power of testing inside the user perspective, following its clicks and asserting from html generated.

Another great library, non built-in, but used by most of Ember applications is [ember-cli-mirage]. This library is used to mock the server responses, it keeps an in-memory database, it comes with **factories**, etc. It's usually used on the tests, but can also be used in development environment.

Write tests in Ember is so cheap, so easy to maintain and `ember-cli-mirage` has a great importance in that.

## Problem 1: Ember is slow => **False**

The first of all, Ember is **fast** and it has to be said. Ember had some problems in the past when re-rendering big lists. A lot of issues were created to improve performance.

Anyway, there's a big promising project [glimmer 2][glimmer-2] that seems to solve all performance issues in rendering for good. This project was inspired by React's Virtual DOM and uses a Stream Tree to identify and apply the changes in the DOM. The results were so good that they added into Ember `2.9.0-alpha.1`, so it will be part of Ember soon.

Another performance issue is related to the first load time. Again there's a promising project to solve this problem: [fastboot]. **Fastboot** is a server side Ember application provided by **NodeJS** and it retrieves a ready html when the application is loaded for the first time.

## Problem 2: Ember doesn't work with SEO

Ember isn't great with SEO (search engine optimization). The truth is that there are some applications that don't care about SEO, but some does, so this is a big issue. This seems to be an issue with search engine crawlers and javascript. Anyway we need to solve that. And the solution here is again **Fastboot** project.

So **Fastboot** solves two problems at once (performance on first load and SEO) by rendering in the server side, so the crawler can index the full page.

## Conclusion

In a nutshell: **Ember is great!** The community has built great tools and libraries that support developers. Some of the best ideas of other frameworks inspired Ember developers to build efficient solutions. Big issues are addressed and solved already by the community and Ember core team.

[broccoli]:         https://github.com/broccolijs/broccoli
[babel]:            https://babeljs.io/
[ember-observer]:   https://emberobserver.com/
[configure]:        https://guides.emberjs.com/v2.7.0/configuring-ember/embedding-applications/
[qunit]:            https://qunitjs.com/
[first-ember-app]:  /ember/first-ember-js-application#testing-your-app
[ember-cli-mirage]: http://www.ember-cli-mirage.com/
[glimmer-2]:        https://github.com/tildeio/glimmer
[fastboot]:         https://github.com/ember-fastboot/fastboot
*[DOM]: Document Object Model
*[SPA]: Single Page Application
*[SEO]: Search Engine Optimization
