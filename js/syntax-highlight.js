document.querySelectorAll("div.highlighter-rouge").forEach(el => {
  const lang = el.getAttribute("class").match(/language-(\S+)/);
  const title = el.dataset.path;

  const header = document.createElement("div");
  header.setAttribute("class", "header");
  header.setAttribute("data-lang", lang && lang[1] || "");
  header.innerHTML = title || "&nbsp;";

  el.prepend(header);
});
