---
layout: post
title:  "Chrome Extensions - Part 1 - Setup"
date:   2016-10-01 12:00:00
last_modified_at: 2016-10-01 12:00:00
categories: javascript
series: chrome-extension
---

Here's a 1st/3 post regarding **Chrome Extension Development**, and for illustrating I'll use my own [netflex] plugin as example. This is a powerful way to add features to the user for existing pages that you don't even have access to the code. It's crazy how many possible solutions you can come up with.

## Chrome Extension

Chrome Extensions are **plugins** to be installed **specifically in Chrome** through [chrome-web-store]. They have the purpose of adding more features to the user when interacting with the browser. By the way, as this plugin will run just in Chrome you can create a ES2015 javascript syntax files **except by** export/import features.

Developing a Chrome plugin is easy and here it is [chrome-extension] documentation. They are actually a bunch of **javascript/css/html** files packaged in **signed/zipped** one. Chrome also updates every installed plugin for the user if a new release comes in, super handy. Developers can also set a price for plugins and make some money with that 💰, or you can open the source code making it free for everybody and contribute to the community. 💸

In fact Chrome Extensions are a simple way to interact with third part pages and add the features you think that should be there. That's why I started my [netflex] plugin and here is my final [netflex-code].

## Setup

To create a project just create a new folder:

```shell
mkdir ~/netflex
```

And then your `manifest.json` file. This is the configuration file for your project:

{: data-path="manifest.json"}
```json
{
  "manifest_version": 2,
  "name": "NetFlex",
  "description": "NetFlex description",
  "version": "0.4",
  "icons": {
  },
  "background": {
  },
  "content_scripts": [
  ],
  "browser_action": {
  },
  "page_action": {
  },
  "permissions": [
  ]
}
```

## Page Action or Browse Action?

**BrowserAction** is intended to be performed in every page, so if your plugin is that generic you should use it.

Otherwise use **PageAction**, and in this case you have to enable your plugin through your `background.js` file. I did that based on a regexp matching with the url.

## Background JS file

First you add **background** and **permissions** entries to `manifest.json` file:

{: data-path="manifest.json"}
```json
{
  ...
  "background": {
    "scripts": ["background.js"]
  },
  ...
  "permissions": [
    "tabs"
  ]
}
```

And then you create your `background.js`:

{: data-path="background.js"}
```javascript
chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  if (tab.url.indexOf('https://www.netflix.com/') == 0) {
    chrome.pageAction.show(tabId);
  }
});
```

And that's how you'll see your plugin disabled/enabled by url:

**enabled:** ![extension-enabled]

**disabled:** ![extension-disabled]

## Wrapping up

As you have noticed, in `background.js` file I'm enabling a **pageAction**. So let's configure the basics of it and also add some icons with sizes based on Chrome guides specification. There it is a, so far, final version of `manifest.json`:

{: data-path="manifest.json"}
```json
{
  "manifest_version": 2,
  "name": "NetFlex",
  "description": "NetFlex description",
  "version": "0.4",
  "icons": {
    "16": "images/icon_16.png",
    "48": "images/icon_48.png",
    "128": "images/icon_128.png"
  },
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
  ],
  "page_action": {
    "default_icon": {
      "19": "images/icon_19.png",
      "38": "images/icon_38.png"
    },
    "default_title": "NetFlex"
  },
  "permissions": [
    "tabs"
  ]
}
```

To install the plugin locally follow this:

1. Open your chrome and type this url: `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked extensions...` and find `netflex` cloned repo.
4. This is how you should see:

![extension-install]

## Conclusion

In this post we learned how to create a basic chrome extension with just **1 json** file for configuration and **1 background javascript** file and some images for **icons**. We also saw how easy was to install locally.

So far super easy right?

In the following post we'll see how to build a PageAction **popup**.

[chrome-extension]:   https://developer.chrome.com/extensions
[chrome-web-store]:   https://chrome.google.com/webstore/category/apps
[netflex-code]:       https://github.com/vnegrisolo/netflex, 'NetFlex Code'
[netflex]:            https://chrome.google.com/webstore/detail/netflex/enabfkegimbpnmiadibjifbmbednodib, 'NetFlex'
[extension-enabled]:  /images/posts/chrome-extension-enabled.png  'NetFlex enabled'
{: .img-responsive width="70%"}
[extension-disabled]: /images/posts/chrome-extension-disabled.png 'NetFlex disabled'
{: .img-responsive width="70%"}
[extension-install]: /images/posts/chrome-extension-install.png 'NetFlex install'
{: .img-responsive width="90%"}
