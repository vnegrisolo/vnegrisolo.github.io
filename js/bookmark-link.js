document.querySelectorAll("h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]").forEach(header => {
  var icon = document.createElement("img");
  icon.setAttribute("class", "icon");
  icon.setAttribute("src", "/svgs/link-gray-dark.svg");
  icon.setAttribute("alt", "Link");

  var link = document.createElement("a");
  link.setAttribute("class", "bookmark");
  link.setAttribute("href", `#${header.getAttribute("id")}`);

  link.prepend(icon);
  header.prepend(link);
});
