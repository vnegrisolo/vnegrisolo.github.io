---
layout: post
title:  "Chrome Extensions - Part 3 - Application"
date:   2016-10-25 12:00:00
last_modified_at: 2016-10-25 12:00:00
categories: javascript
series: chrome-extension
---

That's the final part of a series regarding **Chrome Extension Development**. In this post I'm using a simple version of [netflex] for showing how to configure the injection of your `js/css` files into an existing thrid part website. Also how to receive a message from your popup and then interact with the main application.

# Injecting js/css files

In order to inject your js/css files by chrome extension you need to use the node `content_scripts`:

{: data-path="manifest.json"}
```json
{
  ...
  "content_scripts": [
    {
      "matches": ["https://www.netflix.com/*"],
      "js": ["storage.js", "markup.js", "netflex.js"],
      "css": ["netflex.css"]
    }
  ],
  ...
}
```

In this case these files will be inject when the URL matches with the node `content_scripts.matches`.

# How NetFlex works

Here is an image of how NetFlex works:

![extension-netflix]

It's possible to notice that the plugin adds a button above the movies with it's title. If the user hits this button the whole movie will be hidden. In this case a user can hide already watched movies, or just a movie that it's not desirable.

# NetFlex js file

`netflex.js` is the main file for the whole project and it is responsible for displaying the hide button inside Netflix page and hide all movies that was already marked to be hidden. This code was simplified from the running version for better understanding.

{: data-path="netflex.js"}
```javascript
class NetFlex {
  constructor() {
    this.display = false;
    this.markup  = new NetFlexMarkup;
    this.storage = new NetFlexStorage;
  }
  init() {
    this.listenMessages();
    this.showActions();
  }
  listenMessages() {
    chrome.runtime.onMessage.addListener(request => {
      if(request.message == 'display') {
        (this.display = !this.display) ? this.showTitles() : this.hideTitles();
      }
    });
  }
  showTitles() {
    this.markup.show('.slider-item');
  }
  hideTitles() {
    this.storage.readEach(title => {
      this.markup.each('[aria-label="'+title+'"]', el => {
        this.markup.hideElement(el);
      });
    });
  }
  showActions() {
    this.markup.each('.slider-item', el => {
      let title = el.getElementsByClassName('title_card')[0].getAttribute('aria-label');
      let button = document.createElement('button');
      button.setAttribute('class', 'netflex-toggle');
      button.setAttribute('data-title', title);
      this.markup.prepend(el, button);
    });
    this.markup.onclick('.netflex-toggle', el => {
      this.storage.toggle(el.getAttribute('data-title'));
    });
  }
}

window.onload = () => new NetFlex().init();
```

In this file we can **receive a message** from Popup and in this case toggle between show or hide the **hidden movies**.

You can also see that the button to hide movies was added by this `js` file, so runtime manipulation.

# Conclusion

With chrome extensions it's possible to interact with existing pages. And you don't need to have access to their code, because your code will be injected by Chrome. So this is a very useful tool for your toolbelt.

In addition remember that google chrome uses ES2015 already, so new javascript syntax for free.

[netflex]: https://chrome.google.com/webstore/detail/netflex/enabfkegimbpnmiadibjifbmbednodib, 'NetFlex'

[extension-netflix]: /images/posts/chrome-extension-netflix.png 'Netflix With NetFlex'
{: .img-responsive width="90%"}

*[URL]: Uniform Resource Locator
*[ES2015]: ECMAScript 2015, also known as ES6
