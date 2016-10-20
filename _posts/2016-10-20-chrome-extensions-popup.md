---
layout: post
title:  "Chrome Extensions - Part 2 - Popup"
date:   2016-10-20 12:00:00
last_modified_at: 2016-10-20 12:00:00
categories: javascript
series: chrome-extension
---

This is the 2nd/3 post about **Chrome Extension Development**, and in this post I'm going to talk about **Popup**. Using [netflex] as an example let's see how to configure a Popup, what you can do with it and how to send messages from your Popup and the main page.

## Popup

Popup is a HTML file that will be loaded when the user hits your extension icon.

![extension-popup]

As you see this is my **popup** that displays some movie titles and has two buttons for sending **actions** to the main page.

## Configuration

**Popup** is configured inside either **page_action** or **browser_action**. In this case I'm using a [page-action], so my popup configuration goes undes `page_action` node:

{: data-path="manifest.json"}
```json
{
  ...
  "page_action": {
    "default_icon": {
      "19": "images/icon_19.png",
      "38": "images/icon_38.png"
    },
    "default_popup": "popup.html",
    "default_title": "NetFlex"
  },
  ...
}
```

## Html file

`popup.html` is a full html file loaded in a different window. So your js/css will **not conflict** with any js/css loaded by the main page.

{: data-path="popup.html"}
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>NetFlex</title>
    <link href="netflex.css" rel="stylesheet" type="text/css">
    <script src="popup.js"></script>
  </head>
  <body class="netflex-container">
    <h1>NetFlex</h1>
    <hr/>

    <p>
      <button class="netflex-toggle" data-message="actions">Actions</button>
      => Selecting buttons
    </p>
    <p>
      <button class="netflex-toggle" data-message="display">Display</button>
      => Show/Hide List
    </p>
    <hr/>

    <h3>List</h3>
    <div id="netflex-lists"></div>
  </body>
</html>
```

## JS file

The `popup.js` file holds the logic, including passing messages to the main page. Let's see how:

{: data-path="popup.js"}
```javascript
class NetFlexPopup {
  constructor() {
    this.storage = new NetFlexStorage;
  }
  init() {
    this.showLists();

    document.querySelectorAll('.netflex-toggle').forEach(el => {
      el.onclick = e => {
        e.preventDefault();
        let msg = e.target.getAttribute('data-message');

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          chrome.tabs.sendMessage(tabs[0].id, {'message': msg});
        });
      };
    });
  }
  showLists() {
    let lists = document.querySelectorAll('#netflex-lists')[0];
    lists.innerHTML = '';

    let list = document.createElement('ol');
    this.storage.readEach(item => {
      let node = document.createElement('li');
      node.appendChild(document.createTextNode(item));
      list.appendChild(node);
    });
    lists.appendChild(list);
  }
}

window.onload = () => new NetFlexPopup().init();
```

## Conclusion

The goal with Popups in Chrome Extensions are to support your app with a separate full html/js/css files. In this case you don't need to worry about conflicts, because it will be loaded in different browser `windows`. Then you can retrieve information saved in your storage (HTML5 Local Storage as example). You can send some messages to the main page and in this can manipulate the main page based on user interacting with the popup.

[page-action]: /javascript/chrome-extensions-setup#page-action-or-browse-action 'Chrome Extensions - Page Action'
[background-js]: /javascript/chrome-extensions-setup#background-js-file 'Chrome Extensions - Background JS'

[extension-popup]: /images/posts/chrome-extension-popup.png 'NetFlex Popup'
{: .img-responsive width="90%"}
