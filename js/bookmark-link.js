document.querySelectorAll("h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]").forEach(header => {
  var icon = document.createElement("i");
  icon.setAttribute("class", "fa fa-link");
  icon.setAttribute("aria-hidden", "true");

  var link = document.createElement("a");
  link.setAttribute("class", "bookmark");
  link.setAttribute("href", `#${header.getAttribute("id")}`);

  link.prepend(icon);
  header.prepend(link);
});
