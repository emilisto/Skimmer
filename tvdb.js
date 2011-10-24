(function() {
  this.TVDB = function( options ) {
    var banners = 'http://cache.thetvdb.com/banners/';
    var url =  'http://www.thetvdb.com/api/';
    _.extend(this, {
      find: function(name) {
        var dfd = $.Deferred(),
            uri = url + 'GetSeries.php?seriesname=' + encodeURI(name);
        
        $.get(uri)
          .done(function(doc) {
            var $first = $($(doc).find('Series').get(0))

            var data = {
              language: $first.find('language').text(),
              seriesname: $first.find('SeriesName').text(),
              banner: banners + $first.find('banner').text(),
              overview: $first.find('Overview').text()
            };

            console.debug('-- got some: doc: %o, first: %o, data: %o', doc, $first, data);

            dfd.resolve(data);
          })
          .fail(function() {
            console.debug('-- failed: %o', arguments);
            dfd.reject();
          });
          
        return dfd;
      }
    });
    
    _.bindAll(this);
  };    
}());
