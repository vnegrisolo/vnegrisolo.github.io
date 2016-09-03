$('div.highlighter-rouge').map(function(){
  var codeSnippet = $(this);
  var language = codeSnippet.attr('class').match(/language-(\S+)/)[1];

  var firstCodeLine = codeSnippet.find('code span:first');
  var match = firstCodeLine.text().match(/path: (\S*)/);

  var header = $('<div />', { 'class': 'header small' });
  header.attr('data-language', language);
  if(match) {
    header.attr('data-path', match[1]);
    firstCodeLine.hide();
  }
  codeSnippet.prepend(header);
});
