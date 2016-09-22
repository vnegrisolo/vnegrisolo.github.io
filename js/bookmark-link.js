BookmarkLink = {
  buildLink: function(id){
    var icon = $('<i/>', {
      class: 'fa fa-link',
      'aria-hidden': 'true'
    });

    return $('<a/>', {
      class: 'bookmark',
      href: '#' + id
    }).prepend(icon);
  }
}

$('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]').each(function(){
  var $el = $(this);
  $el.prepend(BookmarkLink.buildLink($el.attr('id')));
});
