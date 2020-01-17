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
  const title = el.dataset.title;

  const header = document.createElement("div");
  header.setAttribute("class", "header");
  header.setAttribute("data-lang", lang && lang[1] !== "plaintext" && lang[1] || "");
  header.innerHTML = title || "&nbsp;";

  const link = document.createElement("a");
  link.setAttribute("class", "clipboard-copy");
  link.setAttribute("href", "#");
  link.addEventListener("click", clipboardCopy)

  el.prepend(link);
  el.prepend(header);
});
