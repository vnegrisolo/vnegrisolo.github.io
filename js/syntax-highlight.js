SyntaxHighlight = {
  buildHeader: function(lang, path){
    return $('<div/>', {
      'class': 'header small',
      'data-lang': lang
    }).prepend(path || '&nbsp;');
  }
}

$('div.highlighter-rouge').each(function(){
  var $el = $(this);
  var lang = $el.attr('class').match(/language-(\S+)/)[1];
  var path = $el.data('path');
  var header = SyntaxHighlight.buildHeader(lang, path);

  $el.prepend(header);
});
