$('pre.highlight').map(function(i, el){
  var codeSnippet = $(el);
  var language = codeSnippet.parent().attr('class').match(/language-(\S+)/)[1];
  codeSnippet.attr('data-language', language);
});
