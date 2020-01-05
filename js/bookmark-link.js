document.querySelectorAll("h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]").forEach(header => {
  const link = document.createElement("a");
  link.setAttribute("class", "bookmark");
  link.setAttribute("href", `#${header.getAttribute("id")}`);

  header.prepend(link);
});
