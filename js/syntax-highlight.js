document.querySelectorAll("div.highlighter-rouge").forEach(el => {
  var lang = el.getAttribute("class").match(/language-(\S+)/);
  var title = el.dataset.path;
  console.warn({lang, title});

  var header = document.createElement("div");
  header.setAttribute("class", "header");
  header.setAttribute("data-lang", lang && lang[1]);
  header.innerHTML = title || "&nbsp;";

  el.prepend(header);
});
