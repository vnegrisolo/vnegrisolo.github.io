$('pre.highlight').map(function(i, el){
  var codeSnippet = $(el);
  var language = codeSnippet.parent().attr('class').match(/language-(\S+)/)[1];
  codeSnippet.attr('data-language', language);

  var firstCodeLine = codeSnippet.find('code span:first');
  var match = firstCodeLine.text().match(/path: (.*)/);
  if(match) {
    codeSnippet.attr('data-path', match[1]);
  }
});
