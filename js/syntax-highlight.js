SyntaxHighlight = {
  buildHeader: function(lang, path){
    return $('<div/>', {
      'class': 'header',
      'data-lang': lang
    }).prepend(path || '&nbsp;');
  }
}

$('div.highlighter-rouge').each(function(){
  var $el = $(this);
  var lang = $el.attr('class').match(/language-(\S+)/);
  var title = $el.data('path');
  var header = SyntaxHighlight.buildHeader(lang && lang[1], title);

  $el.prepend(header);
});
