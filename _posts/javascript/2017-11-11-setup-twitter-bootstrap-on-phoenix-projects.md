---
layout: post
title:  "Setup Twitter Bootstrap on Phoenix projects"
date:   2017-11-11 12:00:00
last_modified_at: 2017-11-11 12:00:00
categories: JavaScript
tags: Elixir Phoenix
---

This is a short post, more like a straightforward recipe for new Elixir on Phoenix projects to use twitter bootstrap. Kind of sharing some frontend management tips to backend developers like me.

## NodeJS, npm and Brunch

In summary [nodejs][nodejs] is a javascript runtime engine, [npm][npm] is the nodejs package manager and [brunch][brunch] is the assets build pipeline. All these three tools were chosen by Phoenix creators to compose the assets toolset used in its projects.

The tools that come with `npm` help us to manage packages that may include: javascripts, css, fonts, etc. Let's see how using Twitter bootstrap as an example.

## Remove some Phoenix built in css

Phoenix apps come with some basic css but they are generally disposable as you'll want to create your own styling very soon in the project life. So first of all let's clean this up:

```shell
rm assets/css/phoenix.css
rm assets/static/images/phoenix.png
```

You may want to update the generated **layout** and **index** page, so check them out and get rid of unnecessary sections on:

- `lib/my_app_web/templates/layout/app.html.eex`
- `lib/my_app_web/templates/page/index.html.eex`

## Setup Javascript

At this point I am assuming that you have `node` and consequentially `npm` installed on your machine with some reasonable new versions.

```shell
$ node -v
v6.2.0
$ npm -v
3.9.0
$ node node_modules/brunch/bin/brunch -v
2.10.9
```

If `brunch` is not installed yet you should run:

```shell
$ cd assets && npm install && cd ..
```

## Building assets for development and production modes:

Then build the assets with `brunch` by running:

```shell
$ cd assets && node node_modules/brunch/bin/brunch build && cd ..
$ mix phx.server
```

The **production** mode requires the following:

```shell
$ cd assets && node node_modules/brunch/bin/brunch build --production && cd ..
$ mix phx.digest
$ MIX_ENV=prod mix phx.server
```

## Update npm packages

Run this command to verify which npm package is outdated:

```shell
$ cd assets && npm outdated && cd ..
Package  Current  Wanted   Latest  Location
brunch    2.10.9  2.10.9  2.10.12
```

In order to update my `npm` packages I use this [npm-check-updates][npm-check-updates] package this way:

```shell
$ npm-check-updates -u
```

## Add Twitter bootstrap into your Phoenix app

Consider Twitter bootstrap as just an example, but the following tips could be applied to other npm packages.

I checked which versions were available with: `npm show bootstrap versions`.

Then I chose to try the `4.0.0-beta.2` version. I guess that they have a small issue with its dependencies, so the first time I tried to install it I got a message to install `popper` and `jquery`. So I did this way:

```shell
$ npm install popper.js --save
$ npm install jquery --save
$ npm install bootstrap@4.0.0-beta.2 --save
```

The previous commands will update my `assets/package.json` file automatically for you.

The first code change required is to import `bootstrap` javascript into the `app.js` file:

{: data-path="assets/js/app.js"}
```shell
import "bootstrap"
```

Secondly we change the `brunch-config.js` file to add the css files into the assets pipeline. Lastly and in the same file we add global javascript variables that will be imported from javascript files imported by npm, in this case `jquery` and `popper`:

{: data-path="assets/brunch-config.js"}
```javascript
exports.config = {
  npm: {
     enabled: true,
     styles: {bootstrap: ["dist/css/bootstrap.css"]},
     globals: {
       $: 'jquery',
       Popper: 'popper.js'
     }
  }
}
```

That's all we need to:
- add a javascript file from a npm package
- add a stylesheet file from a npm package
- import other javascript files from npm packages and made them globally accessible

## Conclusion

As I mentioned before this was a short post to share some frontend management tips to backend developers. I hope you have enjoyed this reading. 👍

{% include markdown/acronyms.md %}
{% include markdown/links.md %}
{% include markdown/images.md %}
