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
              title: $first.find('SeriesName').text(),
              picture: banners + $first.find('banner').text(),
              description: $first.find('Overview').text(),
              link: 'http://www.imdb.com/title/' + $first.find('IMDB_ID').text()
            };

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
  this.IMDB = function( options ) {
    var url =  'http://www.imdbapi.com/?plot=full&t=';
    _.extend(this, {
      find: function(name) {
        var dfd = $.Deferred(),
            uri = url + encodeURI(name);
        
        $.get(uri)
          .done(function(resp) {
            var data = $.parseJSON(resp);
            // var $first = $($(doc).find('Series').get(0))
            // 
            var data = {
              title: data.Title,
              picture: data.Poster,
              description: data.Plot,
              rating: data.Rating,
              link: 'http://www.imdb.com/title/' + data.ID
            };
            
            console.debug('-- got some: doc: %o', data);

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
