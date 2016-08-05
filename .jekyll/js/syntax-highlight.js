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

// classes = $.unique($('.highlighter-rouge pre code span').map(function() { return $(this).attr('class'); }).sort());
// languages = $.unique($('.highlighter-rouge .header').map(function(){ return $(this).data('language'); }).sort());
// classes.each(function() {
//   css = this;
//   languages.each(function(){
//     lang = this;
//     color = 'background: #073642; color: '+$('.highlighter-rouge.language-'+lang+' pre code span.'+css).css('color');
//     texts = $.unique($('.highlighter-rouge.language-'+lang+' pre code span.'+css).map(function(){ return $(this).text(); }).sort());
//     texts.each(function(){
//       console.log("%c "+css + " => " + lang + " => "+this, color);
//     });
//   });
// });

