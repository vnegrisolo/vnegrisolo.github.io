$('div.highlighter-rouge').map(function(i, el){
  var codeSnippet = $(el);
  var language = codeSnippet.attr('class').match(/language-(\S+)/)[1];

  var firstCodeLine = codeSnippet.find('code span:first');
  var match = firstCodeLine.text().match(/path: (\S*)/);

  var header = $(document.createElement("div"));
  header.addClass('header small');
  header.attr('data-language', language);
  if(match) {
    header.attr('data-path', match[1]);
    firstCodeLine.hide();
  }
  codeSnippet.prepend(header);
});
