const getSelection = () => window.getSelection ? window.getSelection() : document.selection;

const clearSelection = () => {
  const selection = getSelection();
  if (selection.empty) {
    selection.empty();
  } else if (selection.removeAllRanges) {
    selection.removeAllRanges();
  }
}

const clipboardCopy = (e) => {
  e.preventDefault();
  clearSelection();
  const anchor = e.target.tagName === "a" ? e.target : e.target.closest("a");
  var range = document.createRange();
  range.selectNode(anchor.nextSibling);
  getSelection().addRange(range);
  document.execCommand("copy");
  clearSelection();
}

document.querySelectorAll("div.highlighter-rouge").forEach(el => {
  const lang = el.getAttribute("class").match(/language-(\S+)/);
  const title = el.dataset.path;

  const header = document.createElement("div");
  header.setAttribute("class", "header");
  header.setAttribute("data-lang", lang && lang[1] !== "plaintext" && lang[1] || "");
  header.innerHTML = title || "&nbsp;";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("data-prefix", "far");
  svg.setAttribute("data-icon", "copy");
  svg.setAttribute("class", "svg-inline--fa fa-copy fa-w-14");
  svg.setAttribute("role", "img");
  svg.setAttribute("viewBox", "0 0 448 512");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const link = document.createElement("a");
  link.setAttribute("class", "clipboard-copy");
  link.setAttribute("href", "#");
  link.addEventListener("click", clipboardCopy)

  svg.prepend(path);
  link.prepend(svg);
  el.prepend(link);
  el.prepend(header);
});
