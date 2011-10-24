(function() {
  if(!this.Skimmer) { this.Skimmer = {}; }
    
  this.Skimmer = function() {
    _.extend(this, {
      keywords: ['xvid', 'dvdr', 'dvd-r', 'hdtv', 'dvdrip', 'proper', 'limited', 'bdrip', '720p'],

      trim: function(text) {
        return text.replace(/^\s+|\s+$/g, ''); 
      },
      _filterText: function(text) {
        if(!this.regex) {
          var regexes = _.map(this.keywords, function(keyword) { return '[\.-]' + keyword; });
          this.regex = new RegExp(regexes.join('|'), 'i');
        }
        return text.match(this.regex);
      },
      _extractName: function(text) {
        // Find earliest occurence of any keyword
        var indices = _.map(this.keywords, function(keyword) {
          var index = text.toLowerCase().indexOf(keyword);
          return index >= 0 ? index : text.length + 1;
        });
        var index = _.min(indices);
        
        // Replace '.' with spaces and trim result
        text = text.slice(0, index);
        text = this.trim(text.replace(/\./g, ' '));
        
        return text;
      },
      _getTextNodesIn: function(node) {
        var textNodes = [],
            whitespace = /^\s*$/;

        function getTextNodes(node) {
          if (node.nodeType == 3) {
            if (!whitespace.test(node.nodeValue)) {
              if($(node).parents('a').length > 0) {
                textNodes.push(node);
              }
            }
          } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
              getTextNodes(node.childNodes[i]);
            }
          }
        }

        getTextNodes(node);

        return textNodes;
      },
      _identify: function(texts) {
        var re = new RegExp(/((.*)(S\d{2}E\d{2})|(.*))/i);
        var ret = {
          type: 'other'
        };
        var text = texts[0];
        if(text) {
          var match = text.match(re);
          console.debug('match: %o', match);
          if(match[2]) {
            ret = {
             name: match[2],
             type: 'tvshow' 
            };
          } else {
            ret = {
              name: match[1],
              type: 'movie'
            }
          }
        }
        
        return ret;
      },

      run: function(node) {
        var self = this;
        var rootNode = node || $('body').get(0);
        var nodes = this._getTextNodesIn(node);
        var texts = _(nodes).chain()
          .map(function(node) { return node.textContent; })
          .filter(this._filterText)
          .map(this._extractName)
          .value();
        
        var data = this._identify(texts);

        return data;
      },
      
      hideTooltip: function() {
        if(this.tooltip) {
          console.debug('hiding');
          $(this.tooltip).remove();
        }
      },
      showTooltip: function(html, pos) {
        this.hideTooltip();
        
        var el = $('<div/>')
          .addClass('tooltip')
          .css({
            "top": pos.top - 100,
            "left": pos.left + 100
          })
          .html('<div>' + html + '</div>')
          .click(this.hideTooltip)
          .appendTo('body');
          
        this.tooltip = el;
      },
      showImage: function(url) {
        if(this.tooltip) {
          var self = this;
          setTimeout(function() {
            self.tooltip.append($('<img/>').attr("src", url))
          }, 1000);
          console.debug('adding image');
        }
      }
    });
    
    _.bindAll(this, '_filterText', '_extractName', '_getTextNodesIn', '_identify', 'run',
                    'hideTooltip', 'showTooltip', 'showImage');
  };
  
  
    
  var skimmer = new Skimmer();
  var imdb = new IMDB();
  var tvdb = new TVDB();
  
  $('body').click(function(ev) {
    if(ev.altKey) {
      var data = skimmer.run(ev.target);

      console.debug('DATA: %o', data);
      function callback(data) {
        var html = '<h2><a href="' + data.link + '" target="_new">' + data.title + '</a></h2><p>' + data.description + '</p>';
        if(data.rating) {
          html += '<h3>' + data.rating + '</h3>';
        }
        
        console.debug('data: %o html: %s', data, html);
        skimmer.showTooltip(html, {
          top: ev.pageY, left: ev.pageX
        });
        
        if(data.picture !== 'N/A') {
          skimmer.showImage(data.picture);
        }        
      }

      if(data.type === 'tvshow') {
        tvdb.find(data.name).then(callback);
      } else if(data.type === 'movie') {
        imdb.find(data.name).then(callback);
      } else {
        console.debug('cant find it');
      }
          
          // console.debug('running: %o', data);
          // chrome.extension.sendRequest({ url: data.banner }, function(response) {
          //   if(response.loaded) {
          //     skimmer.showImage(response.loaded);
          //   } else {
          //     console.debug('no image!');
          //   }
          //   //console.debug('response: %o', response);
          //   
          // });
      
      ev.preventDefault();
    }
  });
}());
