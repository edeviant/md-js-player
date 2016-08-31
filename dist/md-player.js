(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mdPlayer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var mustache  = require('mustache'),
    c$        = require('cash-dom'),
    jsonp     = require('jsonp'),
    audio5    = require('audio5'); // becomes a global

var fa_tag = document.createElement('link');
fa_tag.setAttribute('rel', 'stylesheet');
fa_tag.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(fa_tag);

var css_tag = document.createElement('link');
css_tag.setAttribute("rel", "stylesheet");
// css_tag.setAttribute("href", "http://mdlrs.com/widgets/md-player/md-player-1.0.css");
css_tag.setAttribute("href", "dist/md-player.css");
(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(css_tag);

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// check if i have attributes on me.
// if so, create a md-player div for me with my attributes.
var pageScripts = document.scripts;
var myScript = document.scripts[document.scripts.length-1];
if (c$(myScript).attr('data-playlist-id') || c$(myScript).attr('data-song-id')) {
  var myDiv = '<div class="md-player" data-playlist-id="'+c$(myScript).attr('data-playlist-id')+'" data-song-id="'+c$(myScript).attr('data-song-id')+'" data-template-id="'+c$(myScript).attr('data-template-id')+'"></div>';
  // c$(myScript).after(myDiv);
  document.write(myDiv);
  // console.log(myDiv);
}


c$().ready(function() {


  var sec_to_time = function(p) {
      var sec = Math.ceil(+p % 60);
      var min = Math.floor(+p / 60);
      sec = (sec < 10) ? '0' + sec : sec;
      min = (min < 10) ? '0' + min : min;
      return min + ':' + sec;
  };

  var api_url = "https://xw9883y6af.execute-api.us-east-1.amazonaws.com/production/";

  var templates = {
    "md-player-simple-style": '<div class="media md-player-body">'
      +  '[[ #song ]]'
      +    '<div class="media-left">'
      +      '<div class="play-img-wrap md-play">'
      +        '<img src="[[song.artist.profile_pic_90_url]]" class="img-rounded artist-image">'
      +        '<i class="fa fa-play play-pause-icon play-icon" aria-hidden="true"></i>'
      +        '<i class="fa fa-pause play-pause-icon pause-icon" aria-hidden="true"></i>'
      +      '</div>'
      +    '</div>'
      +    '<div class="media-body">'
      +      '<h3 class="media-heading">'
      +        '<strong>[[ song.title ]]</strong> <small>by</small> [[ song.artist.name ]] <small><span class="elapsed">[[ elapsed ]]</span> - [[ song.duration_formatted ]]</small>'
      +      '</h3>'
      +      '<div class="audio-player">'
      +        '<div class="player-progress">'
      +          '<div class="loaded-container"></div>'
      +          '<div class="played-container"></div>'
      +          '<div class="waveform-container"></div>'
      +        '</div>'
      +      '</div>'
      +    '</div>'
      +    '[[ /song ]]'
      +    '[[ #playlist ]]'
      +    '<div class="md-player-playlist">'
      +      '<ul>'
      +        '[[ #songs ]]'
      +        '<li class="md-playlist-item" data-song-id="[[id]]">'
      +        '<img src="[[artist.profile_pic_90_url]]" width="20" height="20" alt=""><strong>[[ title ]]</strong> <small>by</small> [[ artist.name ]] &mdash; [[ duration_formatted ]]'
      +      '</li>'
      +      '[[ /songs ]]'
      +    '</ul>'
      +  '</div>'
      +  '[[ /playlist ]]'
      +'</div>',
    "md-player-sc-style": '<div class="media md-player-body">'
      + '[[ #song ]]'
      +  '<div class="md-now-playing">'
      +    '<div class="md-track-image md-play-button md-play" style="background: transparent url([[song.artist.profile_pic_200_url]]) 50% 50% no-repeat; background-size: cover;">'
      +      '<i class="fa fa-play md-play-pause-icon md-play-icon" aria-hidden="true"></i>'
      +      '<i class="fa fa-pause md-play-pause-icon md-pause-icon" aria-hidden="true"></i>'
      +    '</div>'
      +    '<div class="md-title-artist">'
      +      '<span class="md-artist-name">[[ song.artist.name ]]</span>'
      +      '<br>'
      +      '<span class="md-song-title">[[ song.title ]]</span>'
      +    '</div>'
      +    '<div class="player-progress">'
      +      '<div class="played-container"></div>'
      +      '<div class="waveform-container"></div>'
      +      '<div class="loaded-container"></div>'
      +    '</div>'
      +    '<div class="md-player-timing">'
      +      '<span class="elapsed">[[ elapsed ]]</span> - [[ song.duration_formatted ]]'
      +    '</div>'
      +  '</div>'
      +  '[[ /song ]]'
      +  '[[ #playlist ]]'
      +  '<div class="md-player-playlist">'
      +    '<ul class="md-playlist-container">'
      +      '[[ #songs ]]'
      +      '<li class="md-playlist-item" data-song-id="[[id]]">'
      +        '<div class="md-track-image" style="background-image: url([[artist.profile_pic_90_url]]);"></div>'
      +        '<span class="md-song-title">[[ title ]]</span> &ndash; <span class="md-artist-name">[[ artist.name ]]</span> &ndash; <span class="md-song-duration">[[ duration_formatted ]]</span>'
      +      '</li>'
      +      '[[ /songs ]]'
      +    '</ul>'
      +  '</div>'
      +  '[[ /playlist ]]'
      +'</div>'
  }

  // module.exports = (function() {

  var $current_player = null;
  var playOnLoad = false;
  var startAtZero = false;

  var audio = new audio5({
    swf_path: '/audio5js/audio5js.swf',
    format_time: false, // keep it in seconds for width calculations
  });
  audio.on('load', function () {
  });
  audio.on('play', function () {
    $current_player.find('.md-play');
    c$('.is-playing').removeClass('is-playing');
    $current_player.addClass('is-playing');
  });
  audio.on('pause', function () {
    $current_player.removeClass('is-playing');
    $current_player.find('.md-play');
  });
  audio.on('canplay', function() {
    if (startAtZero) {
      audio.seek(0);
      startAtZero = false;
    }
    audio.play();
  });
  audio.on('timeupdate', function (position, duration) {
    $current_player.find('.played-container').css('width', (position/duration)*100 + '%');
    $current_player.find('.elapsed').text(sec_to_time(position));
  });
  audio.on('progress', function (load_percent) {
    $current_player.find('.loaded-container').css('width', load_percent + '%');
  });
  audio.on('ended', function () {
    playNextPrevSong($current_player);
  });
  audio.on('error', function (error) {
  });

  var loadSongInPlayer = function(el, songId) {

    var template_style =  c$(el).attr('data-template-id') || 'md-player-sc-style' || 'md-player-simple-style';

    // set template
    var t = templates[template_style];
    var plOffset;

    // add style class
    c$(el).addClass(template_style);

    jsonp(api_url + 'song/' + songId,
      {
        // name: "sdcb_"+(Date.now())
      },
      function(err, resp) {
        if (!resp) return;
        // get element data
        var data = {};
        data.song = resp;
        // console.log(resp);
        data.elapsed = '00:00';
        // attach song data to player container
        c$(el).data('song', data.song);
        // see if player has a custom template
        if (cti = c$(el).attr('data-template-id')) {
          // ensure custom template exists
          if (c$('#'+cti)[0]) {
            t = c$('#'+cti).html();
          }
        }

        // render template
        data.song.duration_formatted = sec_to_time(data.song.duration);
        // char limit for song title
        data.song.title = (data.song.title.length > 40)
                            ? data.song.title.substring(0, 40).trim() + '...'
                            : data.song.title;

        // grab playlist data from player container
        data.playlist = c$(el).data('playlist');

        // capture playlist scroll position for after render
        if (data.playlist) {
          if (c$(el).find('.md-playlist-container').get(0)) {
            plOffset = c$(el).find('.md-player-playlist').get(0).scrollTop;
          }
        }

        // console.log(el);

        // render player
        mustache.parse(t, ["[[", "]]"]);
        c$(el).html(mustache.render(t, data));

        // reset playlist scroll position
        if (plOffset) {
          c$(el).find('.md-player-playlist').get(0).scrollTop = plOffset;
        }

        // if set to play on load
        if (playOnLoad) {
          playOnLoad = false;
          startAtZero = true;
          $current_player = c$(el).closest('.md-player');
          audio.load('http:' + data.song.media.streaming + '.mp3');
          // try { // this breaks in IE 9
          //   audio.seek(0); // won't play without this when switching songs via play/pause
          // } catch(e) {}
        }

        // this gets the wrong number occassionally (to fast to load?) and ends up really wide
        var waveformWidth = c$(el).eq(0).find('.waveform-container').width();

        var q = {
          // callback: "callback_"+(Date.now()),
          color: {
            fg: "BE3026",
            bg: ""
          },
          bar_width: 2,
          bar_gap: 1,
          filename: "waveform.json",
          vertical_align: false,
          // round: 1,
          song_id: data.song.id,
          artist_sku: data.song.artist.sku,
          catalog_slug: (data.song.media.streaming.split('/').filter(function(v) { return v !== ''; }))[1],
          size: {
            height: 55,
            width: waveformWidth
          }
        };

        if (q.size.width < 1) return;
        var waveformUrlParams = '?bar_width='+q.bar_width
                                +'&artist_sku='+q.artist_sku+'&catalog_slug='+q.catalog_slug+'&bar_gap='
                                +q.bar_gap+'&filename='+q.filename+'&vertical_align='+q.vertical_align
                                +'&song_id='+q.song_id+'&size='+q.size.width;

        jsonp(api_url + 'song/waveform' + waveformUrlParams,
          {
            // name: "wvcb_"+(Date.now())
          },
          function(err, waveData) {
            if (!waveData) return;
            var waveformDOM = '<div class="md-wf-container" style="height: ' + q.size.height + 'px; width: ' + q.size.width + 'px;">';
            for (var i=0; i<waveData.peaks.length; i++) {
              var bottom_margin = (!!q.vertical_align) ? (q.size.height - (Math.ceil((waveData.peaks[i]) * (q.size.height/100))))/2 + 'px' : 0;
              waveformDOM += '<div class="md-wf-bar" style="margin-bottom: ' + bottom_margin + '; width: ' + q.bar_width + 'px; height: ' + Math.ceil((waveData.peaks[i]) * (q.size.height/100)) + 'px; margin-left: ' + q.bar_gap + 'px;"></div>';
            }
            waveformDOM += '</div>';
            // attach waveform twice to cover full waveform and played portion
            c$(el).find('.waveform-container').html(waveformDOM);
            c$(el).find('.played-container').html(waveformDOM);
          });
      });
  }

  var loadPlaylistInPlayer = function(el, playlistId) {
    if (!playlistId) {
      return;
    }
    // get data for playlist
    jsonp(api_url + 'playlist/' + playlistId,
      {
        // name: "plcb_"+(Date.now())
      },
      function(err, resp) {
        // get element data
        var data = {};
        data.playlist = resp;
        // formatted duration for display
        for (var i = 0; i < data.playlist.songs.length; i++) {
          data.playlist.songs[i].duration_formatted = sec_to_time(data.playlist.songs[i].duration);
        }
        // attach playlist data to player container
        c$(el).data('playlist', data.playlist);
        // set song to first item from playlist
        loadSongInPlayer(el, data.playlist.songs[0].id);
      });
  }

  var playNextPrevSong = function(el, prev) {
    if (prev) {

    } else { //next
      if ($current_player.hasClass('has-playlist')) {
        var currentSongID = $current_player.data('song').id;
        var items = $current_player.find('.md-playlist-item');
        for (var i = 0; i < items.length; i++) {
          if (c$(items[i]).attr('data-song-id') == currentSongID && c$(items[i+1]).get(0)) {
            // set it to autoplay
            playOnLoad = true;
            // load song
            loadSongInPlayer($current_player, c$(items[i+1]).attr('data-song-id'));
            // we're done
            break;
          }
        }
      }
    }
  }

  // init containers
  c$('.md-player').each(function(el, idx) {
    // ensure player hasn't already been initialized
      if (!c$(el).attr('data-init')) {
        if (+c$(el).attr('data-playlist-id')) {
          c$(el).addClass('has-playlist');
          loadPlaylistInPlayer(el, c$(el).attr('data-playlist-id'));
        } else if (c$(el).attr('data-song-id')) {
          loadSongInPlayer(el, c$(el).attr('data-song-id'));
        }

        // Get the element, add a click listener... for FireFox+
        c$(el).get(0).addEventListener("click", function(e) {
          // console.log('click', e.target, $prev_player, $current_player);
          if (e.target && e.target.className == 'player-progress') {
          var $prev_player = $current_player;
          $current_player = c$(this).closest('.md-player');
            var p = e.offsetX / c$(e.target).width();
            if (!!$prev_player && $prev_player.data('song').id == $current_player.data('song').id) {
              try {
                audio.seek(p * audio.duration);
              } catch(e) {}
            } else {
              audio.load('http:' + $current_player.data('song').media.streaming + '.mp3');
              try { // this can break in IE
                audio.seek(p * $current_player.data('song').duration); // audio.duration is the old song
              } catch(e) {}
            }
          }
          // if (e.target && e.target.className.match('md-play-pause-icon')) {
          //   var $prev_player = $current_player;
          //   $current_player = c$(e.target).closest('.md-player');
          //   console.log($prev_player, $current_player);
          //   // if same player, play/pause
          //   if ($prev_player && audio.load_percent > 0 && $prev_player.data('song').id == $current_player.data('song').id) {
          //     audio.playPause();
          //   } else {
          //     startAtZero = true;
          //     // if new player, load track
          //     audio.load('http:' + $current_player.data('song').media.streaming + '.mp3');
          //     // try { // this breaks in IE 9
          //     //   audio.seek(0); // won't play without this when switching songs via play/pause
          //     // } catch(e) {}
          //   }
          // }
          // if (e.target && e.target.className == 'md-playlist-item') {
          //   if (c$(e.target).attr('data-song-id')) {
          //     playOnLoad = true;
          //     startAtZero = true;
          //     loadSongInPlayer(c$(this).closest('.md-player'), c$(e.target).attr('data-song-id'));
          //   }
          // }
        });

        // attach events
        // these need to be element specific to avoid multiple binds on an element
        c$(el).on('click', '.md-play', function() {
          var $prev_player = $current_player;
          $current_player = c$(this).closest('.md-player');
          // console.log($prev_player,$current_player);
          // console.log(this, $prev_player.data('song').id, $current_player.data('song').id)
          // if same player, play/pause
          if (!!$prev_player && $prev_player.data('song').id == $current_player.data('song').id) {
            try {
              audio.playPause();
            } catch(e) {}
          } else {
            // if new player, load track
            startAtZero = true;
            audio.load('http:' + $current_player.data('song').media.streaming + '.mp3');
          }
        // handle playlist clicks
        }).on('click', '.md-playlist-item', function() {
          if (c$(this).attr('data-song-id')) {
            playOnLoad = true;
            startAtZero = true;
            loadSongInPlayer(c$(this).closest('.md-player'), c$(this).attr('data-song-id'));
          }
        // handle clicks on progress bar
        }).on('click', '.player-progress', function(evt) {
          // === removed so firefox would work ===
          //
          // var $prev_player = $current_player;
          // $current_player = c$(this).closest('.md-player');
          // // console.log(window.event);
          // var p = 0;
          // // if (window.event) {
          // //   p = event.offsetX / c$(this).width();
          // // } else {
          //   // var mouseX = event.clientX;
          //   var thisX = c$(this).get(0).offsetLeft;
          //   var parentX = c$(this).parent().get(0).offsetLeft;
          //   console.log(c$(this), thisX, parentX, evt);
          //   // console.log(event.offsetX / c$(this).width(), (mouseX-thisX) / c$(this).width());
          // // }
          // if ($prev_player && $prev_player.data('song').id == $current_player.data('song').id) {
          //   // try {
          //     audio.seek(p * audio.duration);
          //   // } catch(e) {}
          // } else {
          //   audio.load('http:' + $current_player.data('song').media.streaming + '.mp3');
          //   try { // this breaks in IE
          //     audio.seek(p * $current_player.data('song').duration); // audio.duration is the old song
          //   } catch(e) {}
          // }
        });

        // set to true to avoid re-initializing an existing player if js included multiple times
        c$(el).attr('data-init', true);
        // console.log($current_player);

      };

  });

  // }());

});

},{"audio5":2,"cash-dom":3,"jsonp":6,"mustache":8}],2:[function(require,module,exports){
/*!
 * Audio5js: HTML5 Audio Compatibility Layer
 * https://github.com/zohararad/audio5js
 * License MIT (c) Zohar Arad 2013
 */
(function ($win, ns, factory) {
  "use strict";
  /*global define */
  /*global swfobject */

  if (typeof (module) !== 'undefined' && module.exports) { // CommonJS
    module.exports = factory(ns, $win);
  } else if (typeof (define) === 'function' && define.amd) { // AMD
    define(function () {
      return factory(ns, $win);
    });
  } else { // <script>
    $win[ns] = factory(ns, $win);
  }

}(window, 'Audio5js', function (ns, $win) {

  "use strict";

  var ActiveXObject = $win.ActiveXObject;

  /**
   * AudioError Class
   * @param {String} message error message
   * @constructor
   */
  function AudioError(message) {
    this.message = message;
  }

  AudioError.prototype = new Error();

  /**
   * Clones an object
   * @param obj object to clone
   * @return {Object} cloned object
   */
  function cloneObject(obj) {
    var clone = {}, i;
    for (i in obj) {
      if (typeof (obj[i]) === "object") {
        clone[i] = cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
    }
    return clone;
  }

  /**
   * Extend an object with a mixin
   * @param {Object} target target object to extend
   * @param {Object} mixin object to mix into target
   * @return {*} extended object
   */
  var extend = function (target, mixin) {
    var name, m = cloneObject(mixin);
    for (name in m) {
      if (m.hasOwnProperty(name)) {
        target[name] = m[name];
      }
    }
    return target;
  };

  /**
   * Extend an object's prototype with a mixin
   * @param {Object} target target object to extend
   * @param {Object} mixin object to mix into target
   * @return {*} extended object
   */
  var include = function (target, mixin) {
    return extend(target.prototype, mixin);
  };

  var Pubsub = {
    /**
     * Subscribe to event on a channel
     * @param {String} evt name of channel / event to subscribe
     * @param {Function} fn the callback to execute on message publishing
     * @param {Object} ctx the context in which the callback should be executed
     */
    on: function (evt, fn, ctx) {
      this.subscribe(evt, fn, ctx, false);
    },
    /**
     * Subscribe to a one-time event on a channel
     * @param {String} evt name of channel / event to subscribe
     * @param {Function} fn the callback to execute on message publishing
     * @param {Object} ctx the context in which the callback should be executed
     */
    one: function(evt, fn, ctx) {
      this.subscribe(evt, fn, ctx, true);
    },
    /**
     * Unsubscribe from an event on a channel
     * @param {String} evt name of channel / event to unsubscribe
     * @param {Function} fn the callback used when subscribing to the event
     */
    off: function (evt, fn) {
      if (this.channels[evt] === undefined) { return; }
      var i, l;
      for (i = 0, l = this.channels[evt].length; i  < l; i++) {
        var sub = this.channels[evt][i].fn;
        if (sub === fn) {
          this.channels[evt].splice(i, 1);
          break;
        }
      }
    },
    /**
     * Add event subscription to channel. Called by `on` and `one`
     * @param {String} evt name of channel / event to subscribe
     * @param {Function} fn the callback to execute on message publishing
     * @param {Object} ctx the context in which the callback should be executed
     * @param {Boolean} once indicate if event should be triggered once or not
     */
    subscribe: function (evt, fn, ctx, once) {
      if (this.channels === undefined) {
        this.channels = {};
      }
      this.channels[evt] = this.channels[evt] || [];
      this.channels[evt].push({fn: fn, ctx: ctx, once: (once || false)});
    },
    /**
     * Publish a message on a channel. Accepts **args** after event name
     * @param {String} evt name of channel / event to trigger
     */
    trigger: function (evt) {
      if (this.channels && this.channels.hasOwnProperty(evt)) {
        var args = Array.prototype.slice.call(arguments, 1);
        var a = [];
        while(this.channels[evt].length > 0) {
          var sub = this.channels[evt].shift();
          if (typeof (sub.fn) === 'function') {
            sub.fn.apply(sub.ctx, args);
          }
          if ( !sub.once ){
            a.push(sub);
          }
        }
        this.channels[evt] = a;
      }
    }
  };

  var util = {
    /**
     * Flash embed code string with cross-browser support.
     */
  flash_embed_code: function (id, swf_location, ts) {
      var prefix;
      var s = '<param name="movie" value="' + swf_location + '?playerInstance=window.' + ns + '_flash.instances[\'' + id + '\']&datetime=' + ts + '"/>' +
        '<param name="wmode" value="transparent"/>' +
        '<param name="allowscriptaccess" value="always" />' +
        '</object>';
      if (ActiveXObject) {
        prefix = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1" id="' + id + '">';
      } else {
        prefix = '<object type="application/x-shockwave-flash" data="' + swf_location + '?playerInstance=window.' + ns + '_flash.instances[\'' + id + '\']&datetime=' + ts + '" width="1" height="1" id="' + id + '" >';
      }
      return prefix + s;
    },
    /**
     * Check if browser supports audio mime type.
     * @param {String} mime_type audio mime type to check
     * @return {Boolean} whether browser supports passed audio mime type
     */
    can_play: function (mime_type) {
      var a = document.createElement('audio');
      var mime_str;
      switch (mime_type) {
        case 'mp3':
          mime_str = 'audio/mpeg;';
          break;
        case 'vorbis':
          mime_str = 'audio/ogg; codecs="vorbis"';
          break;
        case 'opus':
          mime_str = 'audio/ogg; codecs="opus"';
          break;
        case 'webm':
          mime_str = 'audio/webm; codecs="vorbis"';
          break;
        case 'mp4':
          mime_str = 'audio/mp4; codecs="mp4a.40.5"';
          break;
        case 'wav':
          mime_str = 'audio/wav; codecs="1"';
          break;
      }
      if (mime_str !== undefined) {
        if (mime_type === 'mp3' && navigator.userAgent.match(/Android/i) && navigator.userAgent.match(/Firefox/i)) {
          return true;
        }
        return !!a.canPlayType && a.canPlayType(mime_str) !== '';
      }
      return false;
    },
    /**
     * Boolean flag indicating whether the browser has Flash installed or not
     */
    has_flash: (function () {
      var r = false;
      if (navigator.plugins && navigator.plugins.length && navigator.plugins['Shockwave Flash']) {
        r = true;
      } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
        var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
        r = mimeType && mimeType.enabledPlugin;
      } else {
        try {
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          r = typeof (ax) === 'object';
        } catch (e) {}
      }
      return r;
    }()),
    /**
     * Embed Flash MP3 player SWF to DOM
     * @param {String} swf_location location of MP3 player SWF
     * @param {String} id swf unique ID used for resolving callbacks from ExternalInterface to Javascript
     */
    embedFlash: function (swf_location, id) {
      var d = document.createElement('div');
      d.style.position = 'absolute';
      d.style.width = '1px';
      d.style.height = '1px';
      d.style.top = '1px';
      document.body.appendChild(d);
      if(typeof($win.swfobject) === 'object'){
        var fv = {
          playerInstance: 'window.'+ ns + '_flash.instances[\''+id+'\']'
        };
        var params = {
          allowscriptaccess: 'always',
          wmode: 'transparent'
        };
        d.innerHTML = '<div id="'+id+'"></div>';
        swfobject.embedSWF(swf_location + '?ts='+(new Date().getTime() + Math.random()), id, "1", "1", "9.0.0", null, fv, params);
      } else {
        var ts = new Date().getTime() + Math.random(); // Ensure swf is not pulled from cache
        d.innerHTML = this.flash_embed_code(id, swf_location, ts);
      }
      return document.getElementById(id);
    },
    /**
     * Formats seconds into a time string hh:mm:ss.
     * @param {Number} seconds seconds to format as string
     * @return {String} formatted time string
     */
    formatTime: function (seconds) {
      var hours = parseInt(seconds / 3600, 10) % 24;
      var minutes = parseInt(seconds / 60, 10) % 60;
      var secs = parseInt(seconds % 60, 10);
      var result, fragment = (minutes < 10 ? "0" + minutes : minutes) + ":" + (secs  < 10 ? "0" + secs : secs);
      if (hours > 0) {
        result = (hours < 10 ? "0" + hours : hours) + ":" + fragment;
      } else {
        result = fragment;
      }
      return result;
    }
  };

  util.use_flash = util.can_play('mp3');

  var Audio5js, FlashAudioPlayer, HTML5AudioPlayer;

  /**
   * Common audio attributes object. Mixed into audio players.
   * @type {Object}
   */
  var AudioAttributes = {
    playing: false, /** {Boolean} player playback state  */
    vol: 1, /** {Float} audio volume */
    duration: 0, /** {Float} audio duration (sec) */
    position: 0, /** {Float} audio position (sec) */
    load_percent: 0, /** {Float} audio file load percent (%) */
    seekable: false, /** {Boolean} is loaded audio seekable */
    ready: null /** {Boolean} is loaded audio seekable */
  };

  /**
   * Global object holding flash-based player instances.
   * Used to create a bridge between Flash's ExternalInterface calls and FlashAudioPlayer instances
   * @type {Object}
   */
  var globalAudio5Flash = $win[ns + '_flash'] = $win[ns + '_flash'] || {
    instances: { }, /** FlashAudioPlayer instance hash */
    count: 0 /** FlashAudioPlayer instance count */
  };

  /**
   * Flash MP3 Audio Player Class
   * @constructor
   */
  FlashAudioPlayer = function () {
    if (util.use_flash && !util.has_flash) {
      throw new Error('Flash Plugin Missing');
    }
  };

  FlashAudioPlayer.prototype = {
    /**
     * Initialize the player
     * @param {String} swf_src path to audio player SWF file
     */
    init: function (swf_src) {
      globalAudio5Flash.count += 1;
      this.id = ns + globalAudio5Flash.count;
      globalAudio5Flash.instances[this.id] = this;
      this.embed(swf_src);
    },
    /**
     * Embed audio player SWF in page and assign reference to audio instance variable
     * @param {String} swf_src path to audio player SWF file
     */
    embed: function (swf_src) {
      util.embedFlash(swf_src, this.id);
    },
    /**
     * ExternalInterface callback indicating SWF is ready
     */
    eiReady: function () {
      this.audio = document.getElementById(this.id);
      this.trigger('ready');
    },
    /**
     * ExternalInterface audio load started callback. Fires when audio starts loading.
     */
    eiLoadStart: function(){
      this.trigger('loadstart');
    },
    /**
     * ExternalInterface audio metadata loaded callback. Fires when audio ID3 tags have been loaded.
     */
    eiLoadedMetadata: function(){
      this.trigger('loadedmetadata');
    },
    /**
     * ExternalInterface audio can play callback. Fires when audio can be played.
     */
    eiCanPlay: function () {
      this.trigger('canplay');
    },
    /**
     * ExternalInterface timeupdate callback. Fires as long as playhead position is updated (audio is being played).
     * @param {Float} position audio playback position (sec)
     * @param {Float} duration audio total duration (sec)
     * @param {Boolean} seekable is audio seekable or not (download or streaming)
     */
    eiTimeUpdate: function (position, duration, seekable) {
      this.position = position;
      this.duration = duration;
      this.seekable = seekable;
      this.trigger('timeupdate', position, (this.seekable ? duration : null));
    },
    /**
     * ExternalInterface download progress callback. Fires as long as audio file is downloaded by browser.
     * @param {Float} percent audio download percent
     * @param {Float} duration audio total duration (sec)
     * * @param {Boolean} seekable is audio seekable or not (download or streaming)
     */
    eiProgress: function (percent, duration, seekable) {
      this.load_percent = percent;
      this.duration = duration;
      this.seekable = seekable;
      this.trigger('progress', percent);
    },
    /**
     * ExternalInterface audio load error callback.
     * @param {String} msg error message
     */
    eiLoadError: function (msg) {
      this.trigger('error', msg);
    },
    /**
     * ExternalInterface audio play callback. Fires when audio starts playing.
     */
    eiPlay: function () {
      this.playing = true;
      this.trigger('play');
    },
    /**
     * ExternalInterface audio pause callback. Fires when audio is paused.
     */
    eiPause: function () {
      this.playing = false;
      this.trigger('pause');
    },
    /**
     * ExternalInterface audio ended callback. Fires when audio playback ended.
     */
    eiEnded: function () {
      this.pause();
      this.trigger('ended');
    },
    /**
     * ExternalInterface audio seeking callback. Fires when audio is being seeked.
     */
    eiSeeking: function(){
      this.trigger('seeking');
    },
    /**
     * ExternalInterface audio seeked callback. Fires when audio has been seeked.
     */
    eiSeeked: function(){
      this.trigger('seeked');
    },
    /**
     * Resets audio position and parameters. Invoked once audio is loaded.
     */
    reset: function () {
      this.seekable = false;
      this.duration = 0;
      this.position = 0;
      this.load_percent = 0;
    },
    /**
     * Load audio from url.
     * @param {String} url URL of audio to load
     */
    load: function (url) {
      this.reset();
      this.audio.load(url);
    },
    /**
     * Play audio
     */
    play: function () {
      this.audio.pplay();
    },
    /**
     * Pause audio
     */
    pause: function () {
      this.audio.ppause();
    },
    /**
     * Get / Set audio volume
     * @param {Float} v audio volume to set between 0 - 1.
     * @return {Float} current audio volume
     */
    volume: function (v) {
      if (v !== undefined && !isNaN(parseInt(v, 10))) {
        this.audio.setVolume(v);
        this.vol = v;
      } else {
        return this.vol;
      }
    },
    /**
     * Seek audio to position
     * @param {Float} position audio position in seconds to seek to.
     */
    seek: function (position) {
      try {
        this.audio.seekTo(position);
        this.position = position;
      } catch (e) {}
    },
    /**
     * Destroy audio object and remove from DOM
     */
    destroyAudio: function() {
      if(this.audio){
        this.pause();
        this.audio.parentNode.removeChild(this.audio);
        delete globalAudio5Flash.instances[this.id];
        delete this.audio;
      }
    }
  };

  include(FlashAudioPlayer, Pubsub);
  include(FlashAudioPlayer, AudioAttributes);

  /**
   * HTML5 Audio Player
   * @constructor
   */
  HTML5AudioPlayer = function () {};

  HTML5AudioPlayer.prototype = {
    /**
     * Initialize the player instance
     */
    init: function () {
      this.trigger('ready');
    },
    /**
     * Create new audio instance
     */
    createAudio: function(){
      this.audio = new Audio();
      this.audio.autoplay = false;
      this.audio.preload = 'auto';
      this.audio.autobuffer = true;
      this.bindEvents();
    },
    /**
     * Destroy current audio instance
     */
    destroyAudio: function(){
      if(this.audio){
        this.pause();
        this.unbindEvents();
        try {
          this.audio.setAttribute('src', '');
        } finally {
          delete this.audio;
        }
      }
    },
    /**
     * Sets up audio event listeners once so adding / removing event listeners is always done
     * on the same callbacks.
     */
    setupEventListeners: function(){
      this.listeners = {
        loadstart: this.onLoadStart.bind(this),
        canplay: this.onLoad.bind(this),
        loadedmetadata: this.onLoadedMetadata.bind(this),
        play: this.onPlay.bind(this),
        pause: this.onPause.bind(this),
        ended: this.onEnded.bind(this),
        error: this.onError.bind(this),
        timeupdate: this.onTimeUpdate.bind(this),
        seeking: this.onSeeking.bind(this),
        seeked: this.onSeeked.bind(this)
      };
    },
    /**
     * Bind DOM events to Audio object
     */
    bindEvents: function() {
      if(this.listeners === undefined){
        this.setupEventListeners();
      }
      this.audio.addEventListener('loadstart', this.listeners.loadstart, false);
      this.audio.addEventListener('canplay', this.listeners.canplay, false);
      this.audio.addEventListener('loadedmetadata', this.listeners.loadedmetadata, false);
      this.audio.addEventListener('play', this.listeners.play, false);
      this.audio.addEventListener('pause', this.listeners.pause, false);
      this.audio.addEventListener('ended', this.listeners.ended, false);
      this.audio.addEventListener('error', this.listeners.error, false);
      this.audio.addEventListener('timeupdate', this.listeners.timeupdate, false);
      this.audio.addEventListener('seeking', this.listeners.seeking, false);
      this.audio.addEventListener('seeked', this.listeners.seeked, false);
    },
    /**
     * Unbind DOM events from Audio object
     */
    unbindEvents: function() {
      this.audio.removeEventListener('loadstart', this.listeners.loadstart);
      this.audio.removeEventListener('canplay', this.listeners.canplay);
      this.audio.removeEventListener('loadedmetadata', this.listeners.loadedmetadata);
      this.audio.removeEventListener('play', this.listeners.play);
      this.audio.removeEventListener('pause', this.listeners.pause);
      this.audio.removeEventListener('ended', this.listeners.ended);
      this.audio.removeEventListener('error', this.listeners.error);
      this.audio.removeEventListener('timeupdate', this.listeners.timeupdate);
      this.audio.removeEventListener('seeking', this.listeners.seeking);
      this.audio.removeEventListener('seeked', this.listeners.seeked);
    },
    /**
     * Audio load start event handler. Triggered when audio starts loading
     */
    onLoadStart: function(){
      this.trigger('loadstart');
    },
    /**
     * Audio canplay event handler. Triggered when audio is loaded and can be played.
     * Resets player parameters and starts audio download progress timer.
     */
    onLoad: function () {
      if(!this.audio){
        return setTimeout(this.onLoad.bind(this), 100);
      }
      this.seekable = this.audio.seekable && this.audio.seekable.length > 0;
      if (this.seekable) {
        this.timer = setInterval(this.onProgress.bind(this), 250);
      }
      this.trigger('canplay');
    },
    /**
     * Audio ID3 load event handler. Triggered when ID3 metadata is loaded.
     */
    onLoadedMetadata: function(){
      this.trigger('loadedmetadata');
    },
    /**
     * Audio play event handler. Triggered when audio starts playing.
     */
    onPlay: function () {
      this.playing = true;
      this.trigger('play');
    },
    /**
     * Audio pause event handler. Triggered when audio is paused.
     */
    onPause: function () {
      this.playing = false;
      this.trigger('pause');
    },
    /**
     * Audio ended event handler. Triggered when audio playback has ended.
     */
    onEnded: function () {
      this.playing = false;
      this.trigger('ended');
    },
    /**
     * Audio timeupdate event handler. Triggered as long as playhead position is updated (audio is being played).
     */
    onTimeUpdate: function () {
      if (this.audio && this.playing) {
        try{
          this.position = this.audio.currentTime;
          this.duration = this.audio.duration === Infinity ? null : this.audio.duration;
        } catch (e){}
        this.trigger('timeupdate', this.position, this.duration);
      }
    },
    /**
     * Audio download progress timer callback. Check audio's download percentage.
     * Called periodically as soon as the audio loads and can be played.
     * Cancelled when audio has fully download or when a new audio file has been loaded to the player.
     */
    onProgress: function () {
      if (this.audio && this.audio.buffered !== null && this.audio.buffered.length) {
        this.duration = this.audio.duration === Infinity ? null : this.audio.duration;
        this.load_percent = parseInt(((this.audio.buffered.end(this.audio.buffered.length - 1) / this.duration) * 100), 10);
        this.trigger('progress', this.load_percent);
        if (this.load_percent >= 100) {
          this.clearLoadProgress();
        }
      }
    },
    /**
     * Audio error event handler
     * @param e error event
     */
    onError: function (e) {
      this.trigger('error', e);
    },
    /**
     * Audio seeking event handler. Triggered when audio seek starts.
     */
    onSeeking: function(){
      this.trigger('seeking');
    },
    /**
     * Audio seeked event handler. Triggered when audio has been seeked.
     */
    onSeeked: function(){
      this.trigger('seeked');
    },
    /**
     * Clears periodical audio download progress callback.
     */
    clearLoadProgress: function () {
      if (this.timer !== undefined) {
        clearInterval(this.timer);
        delete this.timer;
      }
    },
    /**
     * Resets audio position and parameters.
     */
    reset: function () {
      this.clearLoadProgress();
      this.seekable = false;
      this.duration = 0;
      this.position = 0;
      this.load_percent = 0;
    },
    /**
     * Load audio from url.
     * @param {String} url URL of audio to load
     */
    load: function (url) {
      this.reset();
      //this.destroyAudio();
      if(this.audio === undefined){
        this.createAudio();
      }
      this.audio.setAttribute('src', url);
      this.audio.load();
    },
    /**
     * Play audio
     */
    play: function () {
      this.audio.play();
    },
    /**
     * Pause audio
     */
    pause: function () {
      this.audio.pause();
    },
    /**
     * Get / Set audio volume
     * @param {Float} v audio volume to set between 0 - 1.
     * @return {Float} current audio volume
     */
    volume: function (v) {
      if (v !== undefined && !isNaN(parseInt(v, 10))) {
        var vol = v < 0 ? 0 : Math.min(1, v);
        this.audio.volume = vol;
        this.vol = vol;
      } else {
        return this.vol;
      }
    },
    /**
     * Seek audio to position
     * @param {Float} position audio position in seconds to seek to.
     */
    seek: function (position) {
      var playing = this.playing;
      this.position = position;
      this.audio.currentTime = position;
      if (playing) {
        this.play();
      } else {
        if (this.audio.buffered !== null && this.audio.buffered.length) {
          this.trigger('timeupdate', this.position, this.duration);
        }
      }
    }
  };

  include(HTML5AudioPlayer, Pubsub);
  include(HTML5AudioPlayer, AudioAttributes);

  /**
   * Default settings object
   * @type {Object}
   */
  var settings = {
    /**
     * {String} path to Flash audio player SWF file
     */
    swf_path: '/swf/audiojs.swf',
    /**
     * {Boolean} flag indicating whether to throw errors to the page or trigger an error event
     */
    throw_errors: true,
    /**
     * {Boolean} flag indicating whether to format player duration and position to hh:mm:ss or pass as raw seconds
     */
    format_time: true,
    /**
     * {Array} list of codecs to try and use when initializing the player. Used to selectively initialize the internal audio player based on codec support
     */
    codecs: ['mp3']
  };

  /**
   * Audio5js Audio Player
   * @param {Object} s player settings object
   * @constructor
   */
  Audio5js = function (s) {
    s = s || {};
    var k;
    for (k in settings) {
      if (settings.hasOwnProperty(k) && !s.hasOwnProperty(k)) {
        s[k] = settings[k];
      }
    }
    this.init(s);
  };

  /**
   * Check if browser can play a given audio mime type.
   * @param {String} mime_type audio mime type to check.
   * @return {Boolean} is audio mime type supported by browser or not
   */
  Audio5js.can_play = function (mime_type) {
    return util.can_play(mime_type);
  };

  Audio5js.prototype = {
    /**
     * Initialize player instance.
     * @param {Object} s player settings object
     */
    init: function (s) {
      this.ready = false;
      this.settings = s;
      this.audio = this.getPlayer();
      this.bindAudioEvents();
      if (this.settings.use_flash) {
        this.audio.init(s.swf_path);
      } else {
        this.audio.init();
      }
    },
    /**
     * Gets a new audio player instance based on codec support as defined in settings.codecs array.
     * Defaults to MP3 player either HTML or Flash based.
     * @return {FlashAudioPlayer,HTML5AudioPlayer} audio player instance
     */
    getPlayer: function () {
      var i, l, player, codec;
      if(this.settings.use_flash){
        player = new FlashAudioPlayer();
        this.settings.player = {
          engine: 'flash',
          codec: 'mp3'
        };
      } else {
        for (i = 0, l = this.settings.codecs.length; i < l; i++) {
          codec = this.settings.codecs[i];
          if (Audio5js.can_play(codec)) {
            player = new HTML5AudioPlayer();
            this.settings.use_flash = false;
            this.settings.player = {
              engine: 'html',
              codec: codec
            };
            break;
          }
        }
        if (player === undefined) {
          // here we double check for mp3 support instead of defaulting to Flash in case user overrode the settings.codecs array with an empty array.
          this.settings.use_flash = !Audio5js.can_play('mp3');
          player = this.settings.use_flash ? new FlashAudioPlayer() : new HTML5AudioPlayer();
          this.settings.player = {
            engine: (this.settings.use_flash ? 'flash' : 'html'),
            codec: 'mp3'
          };
        }
      }
      return player;
    },
    /**
     * Bind events from audio object to internal callbacks
     */
    bindAudioEvents: function () {
      this.audio.on('ready', this.onReady, this);
      this.audio.on('loadstart', this.onLoadStart, this);
      this.audio.on('loadedmetadata', this.onLoadedMetadata, this);
      this.audio.on('play', this.onPlay, this);
      this.audio.on('pause', this.onPause, this);
      this.audio.on('ended', this.onEnded, this);
      this.audio.on('canplay', this.onCanPlay, this);
      this.audio.on('timeupdate', this.onTimeUpdate, this);
      this.audio.on('progress', this.onProgress, this);
      this.audio.on('error', this.onError, this);
      this.audio.on('seeking', this.onSeeking, this);
      this.audio.on('seeked', this.onSeeked, this);
    },
    /**
     * Bind events from audio object to internal callbacks
     */
    unbindAudioEvents: function () {
      this.audio.off('ready', this.onReady);
      this.audio.off('loadstart', this.onLoadStart);
      this.audio.off('loadedmetadata', this.onLoadedMetadata);
      this.audio.off('play', this.onPlay);
      this.audio.off('pause', this.onPause);
      this.audio.off('ended', this.onEnded);
      this.audio.off('canplay', this.onCanPlay);
      this.audio.off('timeupdate', this.onTimeUpdate);
      this.audio.off('progress', this.onProgress);
      this.audio.off('error', this.onError);
      this.audio.off('seeking', this.onSeeking);
      this.audio.off('seeked', this.onSeeked);
    },
    /**
     * Load audio from URL
     * @param {String} url URL of audio to load
     */
    load: function (url) {
      var that = this,
          f = function(u){
            that.audio.load(u);
            that.trigger('load');
          };

      if(this.ready){
        f(url);
      } else {
        this.on('ready', f);
      }
    },
    /**
     * Play audio
     */
    play: function () {
      if(!this.playing){
        this.audio.play();
      }
    },
    /**
     * Pause audio
     */
    pause: function () {
      if(this.playing){
        this.audio.pause();
      }
    },
    /**
     * Toggle audio play / pause
     */
    playPause: function () {
      this[this.playing ? 'pause' : 'play']();
    },
    /**
     * Get / Set audio volume
     * @param {Float} v audio volume to set between 0 - 1.
     * @return {Float} current audio volume
     */
    volume: function (v) {
      if (v !== undefined && !isNaN(parseInt(v, 10))) {
        this.audio.volume(v);
        this.vol = v;
      } else {
        return this.vol;
      }
    },
    /**
     * Seek audio to position
     * @param {Float} position audio position in seconds to seek to.
     */
    seek: function (position) {
      this.audio.seek(position);
      this.position = position;
    },
    /**
     * Destroy audio object and remove from DOM
     */
    destroy: function() {
      this.unbindAudioEvents();
      this.audio.destroyAudio();
    },
    /**
     * Callback for audio ready event. Indicates audio is ready for playback.
     * Looks for ready callback in settings object and invokes it in the context of player instance
     */
    onReady: function () {
      this.ready = true;
      if (typeof (this.settings.ready) === 'function') {
        this.settings.ready.call(this, this.settings.player);
      }
      this.trigger('ready');
    },
    /**
     * Audio load start event handler
     */
    onLoadStart: function(){
      this.trigger('loadstart');
    },
    /**
     * Audio metadata loaded event handler
     */
    onLoadedMetadata: function(){
      this.trigger('loadedmetadata');
    },
    /**
     * Audio play event handler
     */
    onPlay: function () {
      this.playing = true;
      this.trigger('play');
    },
    /**
     * Audio pause event handler
     */
    onPause: function () {
      this.playing = false;
      this.trigger('pause');
    },
    /**
     * Playback end event handler
     */
    onEnded: function () {
      this.playing = false;
      this.trigger('ended');
    },
    /**
     * Audio error event handler
     */
    onError: function () {
      var error = new AudioError('Audio Error. Failed to Load Audio');
      if (this.settings.throw_errors) {
        throw error;
      } else {
        this.trigger('error', error);
      }
    },
    /**
     * Audio canplay event handler. Triggered when enough audio has been loaded to by played.
     */
    onCanPlay: function () {
      this.trigger('canplay');
    },
    /**
     * Audio seeking event handler
     */
    onSeeking: function(){
      this.trigger('seeking');
    },
    /**
     * Audio seeked event handler
     */
    onSeeked: function(){
      this.trigger('seeked');
    },
    /**
     * Playback time update event handler
     * @param {Float} position play head position (sec)
     * @param {Float} duration audio duration (sec)
     */
    onTimeUpdate: function (position, duration) {
      this.position = this.settings.format_time ? util.formatTime(position) : position;
      if (this.duration !== duration) {
        this.duration = this.settings.format_time && duration !== null ? util.formatTime(duration) : duration;
      }
      this.trigger('timeupdate', this.position, this.duration);
    },
    /**
     * Audio download progress event handler
     * @param {Float} loaded audio download percent
     */
    onProgress: function (loaded) {
      this.duration = this.audio.duration;
      this.load_percent = loaded;
      this.trigger('progress', loaded);
    }
  };

  include(Audio5js, Pubsub);
  include(Audio5js, AudioAttributes);

  return Audio5js;

}));

},{}],3:[function(require,module,exports){
"use strict";

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof exports !== "undefined") {
    module.exports = factory();
  } else {
    root.cash = root.$ = factory();
  }
})(this, function () {
  var doc = document, win = window, ArrayProto = Array.prototype, slice = ArrayProto.slice, filter = ArrayProto.filter, push = ArrayProto.push;

  var noop = function () {}, isFunction = function (item) {
    return typeof item === typeof noop;
  }, isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/, classMatch = /^\.[\w-]*$/, htmlMatch = /<.+>/, singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = (classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
    return elems;
  }

  var frag, tmp;
  function parseHTML(str) {
    frag = frag || doc.createDocumentFragment();
    tmp = tmp || frag.appendChild(doc.createElement("div"));
    tmp.innerHTML = str;
    return tmp.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector, i = 0, length;

    if (isString(selector)) {
      elems = (idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context));

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = {
    constructor: cash,
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments), length = args.length, i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length, i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    return (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector).call(el, selector);
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length, i = first.length, j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return (node[uid] = node[uid] || {});
  }

  function setData(node, key, value) {
    return (getDataCache(node)[key] = value);
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (key, value) {
      // TODO: tear out into module for IE9
      if (!value) {
        return getData(this[0], key);
      }
      return this.each(function (v) {
        return setData(v, key, value);
      });
    },

    removeData: function (key) {
      // TODO: tear out into module for IE9
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function hasClass(v, c) {
    return (v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className));
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = c.match(notWhiteMatch);

      return this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      });
    },

    attr: function (name, value) {
      if (!value) {
        return (this[0].getAttribute ? this[0].getAttribute(name) : this[0][name]);
      }
      return this.each(function (v) {
        if (v.setAttribute) {
          v.setAttribute(name, value);
        } else {
          v[name] = value;
        }
      });
    },

    hasClass: function (c) {
      var check = false;
      this.each(function (v) {
        check = hasClass(v, c);
        return !check;
      });
      return check;
    },

    prop: function (name, value) {
      if (!value) {
        return this[0][name];
      }
      return this.each(function (v) {
        v[name] = value;
      });
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      var classes = c.match(notWhiteMatch);

      return this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      });
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = c.match(notWhiteMatch);

      return this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      });
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      return filter.call(this, (isString(selector) ? function (e) {
        return matches(e, selector);
      } : selector));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return (index < 0 ? this[index + this.length] : this[index]);
    },

    index: function (elem) {
      var f = this[0];
      return slice.call(elem ? cash(elem) : cash(f).parent().children()).indexOf(f);
    },

    last: function () {
      return this.eq(-1);
    }

  });

  var getPrefixedProp = (function () {
    var cache = {}, div = doc.createElement("div"), style = div.style, camelRegex = /(?:^\w|[A-Z]|\b\w)/g, whiteSpace = /\s+/g;

    function camelCase(str) {
      return str.replace(camelRegex, function (letter, index) {
        return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
      }).replace(whiteSpace, "");
    }

    return function (prop) {
      prop = camelCase(prop);
      if (cache[prop]) {
        return cache[prop];
      }

      var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "ms", "o"], props = (prop + " " + (prefixes).join(ucProp + " ") + ucProp).split(" ");

      each(props, function (p) {
        if (p in style) {
          cache[p] = prop = cache[prop] = p;
          return false;
        }
      });

      return cache[prop];
    };
  }());

  fn.extend({
    css: function (prop, value) {
      if (isString(prop)) {
        prop = getPrefixedProp(prop);
        return (value ? this.each(function (v) {
          return v.style[prop] = value;
        }) : win.getComputedStyle(this[0])[prop]);
      }

      for (var key in prop) {
        this.css(key, prop[key]);
      }

      return this;
    }

  });

  function compute(el, prop) {
    return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
  }

  each(["Width", "Height"], function (v) {
    var lower = v.toLowerCase();

    fn[lower] = function () {
      return this[0].getBoundingClientRect()[lower];
    };

    fn["inner" + v] = function () {
      return this[0]["client" + v];
    };

    fn["outer" + v] = function (margins) {
      return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
    };
  });

  function registerEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
    eventCache[eventName] = eventCache[eventName] || [];
    eventCache[eventName].push(callback);
    node.addEventListener(eventName, callback);
  }

  function removeEvent(node, eventName, callback) {
    var eventCache = getData(node, "_cashEvents")[eventName];
    if (callback) {
      node.removeEventListener(eventName, callback);
    } else {
      each(eventCache, function (event) {
        node.removeEventListener(eventName, event);
      });
      eventCache = [];
    }
  }

  fn.extend({
    off: function (eventName, callback) {
      return this.each(function (v) {
        return removeEvent(v, eventName, callback);
      });
    },

    on: function (eventName, delegate, callback, runOnce) {
      var originalCallback;

      if (!isString(eventName)) {
        for (var key in eventName) {
          this.on(key, delegate, eventName[key]);
        }
        return this;
      }

      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }

      if (eventName === "ready") {
        onReady(callback);return this;
      }

      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;

          if (matches(t, delegate)) {
            originalCallback.call(t);
          } else {
            while (!matches(t, delegate)) {
              if (t === this) {
                return (t = false);
              }
              t = t.parentNode;
            }

            if (t) {
              originalCallback.call(t);
            }
          }
        };
      }

      return this.each(function (v) {
        var finalCallback = callback;
        if (runOnce) {
          finalCallback = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    trigger: function (eventName) {
      var evt = doc.createEvent("HTMLEvents");
      evt.initEvent(eventName, true, false);
      return this.each(function (v) {
        return v.dispatchEvent(evt);
      });
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }
  function isCheckable(field) {
    return field.type === "radio" || field.type === "checkbox";
  }

  var formExcludes = ["file", "reset", "submit", "button"];

  fn.extend({
    serialize: function () {
      var formEl = this[0].elements, query = "";

      each(formEl, function (field) {
        if (field.name && formExcludes.indexOf(field.type) < 0) {
          if (field.type === "select-multiple") {
            each(field.options, function (o) {
              if (o.selected) {
                query += encode(field.name, o.value);
              }
            });
          } else if (!isCheckable(field) || (isCheckable(field) && field.checked)) {
            query += encode(field.name, field.value);
          }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return this[0].value;
      } else {
        return this.each(function (v) {
          return v.value = value;
        });
      }
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, (i === 0 ? child : child.cloneNode(true)), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = (content.nodeType ? content[0].outerHTML : content);
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;


      cash(selector).each(function (el, i) {
        var parent = el.parentNode, sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore((i === 0 ? v : v.cloneNode(true)), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        return v.parentNode.removeChild(v);
      });
    },

    text: function (content) {
      if (!content) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  function directCompare(el, selector) {
    return el === selector;
  }

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return (!selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      }));
    },

    closest: function (selector) {
      if (!selector || matches(this[0], selector)) {
        return this;
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false, comparator = (isString(selector) ? matches : selector.cash ? function (el) {
        return selector.is(el);
      } : directCompare);

      this.each(function (el, i) {
        match = comparator(el, selector, i);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector) {
        return cash();
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      return filter.call(this, function (el) {
        return cash(el).find(selector).length !== 0;
      });
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      return filter.call(this, function (el) {
        return !matches(el, selector);
      });
    },

    parent: function () {
      var result = this.map(function (item) {
        return item.parentElement || doc.body.parentNode;
      });

      return unique(result);
    },

    parents: function (selector) {
      var last, result = [];

      this.each(function (item) {
        last = item;

        while (last !== doc.body.parentNode) {
          last = last.parentElement;

          if (!selector || (selector && matches(last, selector))) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function () {
      var collection = this.parent().children(), el = this[0];

      return filter.call(collection, function (i) {
        return i !== el;
      });
    }

  });


  return cash;
});
},{}],4:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":5}],5:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":7}],6:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    debug('jsonp got', data);
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}

},{"debug":4}],7:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],8:[function(require,module,exports){
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/

(function defineMustache (global, factory) {
  if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    global.Mustache = {};
    factory(global.Mustache); // script, wsh, asp
  }
}(this, function mustacheFactory (mustache) {

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(value, names[index]);

            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.2.1';
  mustache.tags = [ '{{', '}}' ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render (template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */ // eslint wants camel cased function name
  mustache.to_html = function to_html (template, view, partials, send) {
    /*eslint-enable*/

    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL24vbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hdWRpbzUvYXVkaW81LmpzIiwibm9kZV9tb2R1bGVzL2Nhc2gtZG9tL2Rpc3QvY2FzaC5qcyIsIm5vZGVfbW9kdWxlcy9kZWJ1Zy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL2RlYnVnLmpzIiwibm9kZV9tb2R1bGVzL2pzb25wL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL211c3RhY2hlL211c3RhY2hlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBtdXN0YWNoZSAgPSByZXF1aXJlKCdtdXN0YWNoZScpLFxuICAgIGMkICAgICAgICA9IHJlcXVpcmUoJ2Nhc2gtZG9tJyksXG4gICAganNvbnAgICAgID0gcmVxdWlyZSgnanNvbnAnKSxcbiAgICBhdWRpbzUgICAgPSByZXF1aXJlKCdhdWRpbzUnKTsgLy8gYmVjb21lcyBhIGdsb2JhbFxuXG52YXIgZmFfdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuZmFfdGFnLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKTtcbmZhX3RhZy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnaHR0cHM6Ly9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbS9mb250LWF3ZXNvbWUvNC41LjAvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzJyk7XG4oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGZhX3RhZyk7XG5cbnZhciBjc3NfdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuY3NzX3RhZy5zZXRBdHRyaWJ1dGUoXCJyZWxcIiwgXCJzdHlsZXNoZWV0XCIpO1xuLy8gY3NzX3RhZy5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiaHR0cDovL21kbHJzLmNvbS93aWRnZXRzL21kLXBsYXllci9tZC1wbGF5ZXItMS4wLmNzc1wiKTtcbmNzc190YWcuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImRpc3QvbWQtcGxheWVyLmNzc1wiKTtcbihkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0gfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChjc3NfdGFnKTtcblxuLy8gPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09XG5cbi8vIGNoZWNrIGlmIGkgaGF2ZSBhdHRyaWJ1dGVzIG9uIG1lLlxuLy8gaWYgc28sIGNyZWF0ZSBhIG1kLXBsYXllciBkaXYgZm9yIG1lIHdpdGggbXkgYXR0cmlidXRlcy5cbnZhciBwYWdlU2NyaXB0cyA9IGRvY3VtZW50LnNjcmlwdHM7XG52YXIgbXlTY3JpcHQgPSBkb2N1bWVudC5zY3JpcHRzW2RvY3VtZW50LnNjcmlwdHMubGVuZ3RoLTFdO1xuaWYgKGMkKG15U2NyaXB0KS5hdHRyKCdkYXRhLXBsYXlsaXN0LWlkJykgfHwgYyQobXlTY3JpcHQpLmF0dHIoJ2RhdGEtc29uZy1pZCcpKSB7XG4gIHZhciBteURpdiA9ICc8ZGl2IGNsYXNzPVwibWQtcGxheWVyXCIgZGF0YS1wbGF5bGlzdC1pZD1cIicrYyQobXlTY3JpcHQpLmF0dHIoJ2RhdGEtcGxheWxpc3QtaWQnKSsnXCIgZGF0YS1zb25nLWlkPVwiJytjJChteVNjcmlwdCkuYXR0cignZGF0YS1zb25nLWlkJykrJ1wiIGRhdGEtdGVtcGxhdGUtaWQ9XCInK2MkKG15U2NyaXB0KS5hdHRyKCdkYXRhLXRlbXBsYXRlLWlkJykrJ1wiPjwvZGl2Pic7XG4gIC8vIGMkKG15U2NyaXB0KS5hZnRlcihteURpdik7XG4gIGRvY3VtZW50LndyaXRlKG15RGl2KTtcbiAgLy8gY29uc29sZS5sb2cobXlEaXYpO1xufVxuXG5cbmMkKCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cblxuICB2YXIgc2VjX3RvX3RpbWUgPSBmdW5jdGlvbihwKSB7XG4gICAgICB2YXIgc2VjID0gTWF0aC5jZWlsKCtwICUgNjApO1xuICAgICAgdmFyIG1pbiA9IE1hdGguZmxvb3IoK3AgLyA2MCk7XG4gICAgICBzZWMgPSAoc2VjIDwgMTApID8gJzAnICsgc2VjIDogc2VjO1xuICAgICAgbWluID0gKG1pbiA8IDEwKSA/ICcwJyArIG1pbiA6IG1pbjtcbiAgICAgIHJldHVybiBtaW4gKyAnOicgKyBzZWM7XG4gIH07XG5cbiAgdmFyIGFwaV91cmwgPSBcImh0dHBzOi8veHc5ODgzeTZhZi5leGVjdXRlLWFwaS51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS9wcm9kdWN0aW9uL1wiO1xuXG4gIHZhciB0ZW1wbGF0ZXMgPSB7XG4gICAgXCJtZC1wbGF5ZXItc2ltcGxlLXN0eWxlXCI6ICc8ZGl2IGNsYXNzPVwibWVkaWEgbWQtcGxheWVyLWJvZHlcIj4nXG4gICAgICArICAnW1sgI3NvbmcgXV0nXG4gICAgICArICAgICc8ZGl2IGNsYXNzPVwibWVkaWEtbGVmdFwiPidcbiAgICAgICsgICAgICAnPGRpdiBjbGFzcz1cInBsYXktaW1nLXdyYXAgbWQtcGxheVwiPidcbiAgICAgICsgICAgICAgICc8aW1nIHNyYz1cIltbc29uZy5hcnRpc3QucHJvZmlsZV9waWNfOTBfdXJsXV1cIiBjbGFzcz1cImltZy1yb3VuZGVkIGFydGlzdC1pbWFnZVwiPidcbiAgICAgICsgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLXBsYXkgcGxheS1wYXVzZS1pY29uIHBsYXktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nXG4gICAgICArICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1wYXVzZSBwbGF5LXBhdXNlLWljb24gcGF1c2UtaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4nXG4gICAgICArICAgICAgJzwvZGl2PidcbiAgICAgICsgICAgJzwvZGl2PidcbiAgICAgICsgICAgJzxkaXYgY2xhc3M9XCJtZWRpYS1ib2R5XCI+J1xuICAgICAgKyAgICAgICc8aDMgY2xhc3M9XCJtZWRpYS1oZWFkaW5nXCI+J1xuICAgICAgKyAgICAgICAgJzxzdHJvbmc+W1sgc29uZy50aXRsZSBdXTwvc3Ryb25nPiA8c21hbGw+Ynk8L3NtYWxsPiBbWyBzb25nLmFydGlzdC5uYW1lIF1dIDxzbWFsbD48c3BhbiBjbGFzcz1cImVsYXBzZWRcIj5bWyBlbGFwc2VkIF1dPC9zcGFuPiAtIFtbIHNvbmcuZHVyYXRpb25fZm9ybWF0dGVkIF1dPC9zbWFsbD4nXG4gICAgICArICAgICAgJzwvaDM+J1xuICAgICAgKyAgICAgICc8ZGl2IGNsYXNzPVwiYXVkaW8tcGxheWVyXCI+J1xuICAgICAgKyAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGF5ZXItcHJvZ3Jlc3NcIj4nXG4gICAgICArICAgICAgICAgICc8ZGl2IGNsYXNzPVwibG9hZGVkLWNvbnRhaW5lclwiPjwvZGl2PidcbiAgICAgICsgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGF5ZWQtY29udGFpbmVyXCI+PC9kaXY+J1xuICAgICAgKyAgICAgICAgICAnPGRpdiBjbGFzcz1cIndhdmVmb3JtLWNvbnRhaW5lclwiPjwvZGl2PidcbiAgICAgICsgICAgICAgICc8L2Rpdj4nXG4gICAgICArICAgICAgJzwvZGl2PidcbiAgICAgICsgICAgJzwvZGl2PidcbiAgICAgICsgICAgJ1tbIC9zb25nIF1dJ1xuICAgICAgKyAgICAnW1sgI3BsYXlsaXN0IF1dJ1xuICAgICAgKyAgICAnPGRpdiBjbGFzcz1cIm1kLXBsYXllci1wbGF5bGlzdFwiPidcbiAgICAgICsgICAgICAnPHVsPidcbiAgICAgICsgICAgICAgICdbWyAjc29uZ3MgXV0nXG4gICAgICArICAgICAgICAnPGxpIGNsYXNzPVwibWQtcGxheWxpc3QtaXRlbVwiIGRhdGEtc29uZy1pZD1cIltbaWRdXVwiPidcbiAgICAgICsgICAgICAgICc8aW1nIHNyYz1cIltbYXJ0aXN0LnByb2ZpbGVfcGljXzkwX3VybF1dXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgYWx0PVwiXCI+PHN0cm9uZz5bWyB0aXRsZSBdXTwvc3Ryb25nPiA8c21hbGw+Ynk8L3NtYWxsPiBbWyBhcnRpc3QubmFtZSBdXSAmbWRhc2g7IFtbIGR1cmF0aW9uX2Zvcm1hdHRlZCBdXSdcbiAgICAgICsgICAgICAnPC9saT4nXG4gICAgICArICAgICAgJ1tbIC9zb25ncyBdXSdcbiAgICAgICsgICAgJzwvdWw+J1xuICAgICAgKyAgJzwvZGl2PidcbiAgICAgICsgICdbWyAvcGxheWxpc3QgXV0nXG4gICAgICArJzwvZGl2PicsXG4gICAgXCJtZC1wbGF5ZXItc2Mtc3R5bGVcIjogJzxkaXYgY2xhc3M9XCJtZWRpYSBtZC1wbGF5ZXItYm9keVwiPidcbiAgICAgICsgJ1tbICNzb25nIF1dJ1xuICAgICAgKyAgJzxkaXYgY2xhc3M9XCJtZC1ub3ctcGxheWluZ1wiPidcbiAgICAgICsgICAgJzxkaXYgY2xhc3M9XCJtZC10cmFjay1pbWFnZSBtZC1wbGF5LWJ1dHRvbiBtZC1wbGF5XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudCB1cmwoW1tzb25nLmFydGlzdC5wcm9maWxlX3BpY18yMDBfdXJsXV0pIDUwJSA1MCUgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiPidcbiAgICAgICsgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1wbGF5IG1kLXBsYXktcGF1c2UtaWNvbiBtZC1wbGF5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+J1xuICAgICAgKyAgICAgICc8aSBjbGFzcz1cImZhIGZhLXBhdXNlIG1kLXBsYXktcGF1c2UtaWNvbiBtZC1wYXVzZS1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPidcbiAgICAgICsgICAgJzwvZGl2PidcbiAgICAgICsgICAgJzxkaXYgY2xhc3M9XCJtZC10aXRsZS1hcnRpc3RcIj4nXG4gICAgICArICAgICAgJzxzcGFuIGNsYXNzPVwibWQtYXJ0aXN0LW5hbWVcIj5bWyBzb25nLmFydGlzdC5uYW1lIF1dPC9zcGFuPidcbiAgICAgICsgICAgICAnPGJyPidcbiAgICAgICsgICAgICAnPHNwYW4gY2xhc3M9XCJtZC1zb25nLXRpdGxlXCI+W1sgc29uZy50aXRsZSBdXTwvc3Bhbj4nXG4gICAgICArICAgICc8L2Rpdj4nXG4gICAgICArICAgICc8ZGl2IGNsYXNzPVwicGxheWVyLXByb2dyZXNzXCI+J1xuICAgICAgKyAgICAgICc8ZGl2IGNsYXNzPVwicGxheWVkLWNvbnRhaW5lclwiPjwvZGl2PidcbiAgICAgICsgICAgICAnPGRpdiBjbGFzcz1cIndhdmVmb3JtLWNvbnRhaW5lclwiPjwvZGl2PidcbiAgICAgICsgICAgICAnPGRpdiBjbGFzcz1cImxvYWRlZC1jb250YWluZXJcIj48L2Rpdj4nXG4gICAgICArICAgICc8L2Rpdj4nXG4gICAgICArICAgICc8ZGl2IGNsYXNzPVwibWQtcGxheWVyLXRpbWluZ1wiPidcbiAgICAgICsgICAgICAnPHNwYW4gY2xhc3M9XCJlbGFwc2VkXCI+W1sgZWxhcHNlZCBdXTwvc3Bhbj4gLSBbWyBzb25nLmR1cmF0aW9uX2Zvcm1hdHRlZCBdXSdcbiAgICAgICsgICAgJzwvZGl2PidcbiAgICAgICsgICc8L2Rpdj4nXG4gICAgICArICAnW1sgL3NvbmcgXV0nXG4gICAgICArICAnW1sgI3BsYXlsaXN0IF1dJ1xuICAgICAgKyAgJzxkaXYgY2xhc3M9XCJtZC1wbGF5ZXItcGxheWxpc3RcIj4nXG4gICAgICArICAgICc8dWwgY2xhc3M9XCJtZC1wbGF5bGlzdC1jb250YWluZXJcIj4nXG4gICAgICArICAgICAgJ1tbICNzb25ncyBdXSdcbiAgICAgICsgICAgICAnPGxpIGNsYXNzPVwibWQtcGxheWxpc3QtaXRlbVwiIGRhdGEtc29uZy1pZD1cIltbaWRdXVwiPidcbiAgICAgICsgICAgICAgICc8ZGl2IGNsYXNzPVwibWQtdHJhY2staW1hZ2VcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybChbW2FydGlzdC5wcm9maWxlX3BpY185MF91cmxdXSk7XCI+PC9kaXY+J1xuICAgICAgKyAgICAgICAgJzxzcGFuIGNsYXNzPVwibWQtc29uZy10aXRsZVwiPltbIHRpdGxlIF1dPC9zcGFuPiAmbmRhc2g7IDxzcGFuIGNsYXNzPVwibWQtYXJ0aXN0LW5hbWVcIj5bWyBhcnRpc3QubmFtZSBdXTwvc3Bhbj4gJm5kYXNoOyA8c3BhbiBjbGFzcz1cIm1kLXNvbmctZHVyYXRpb25cIj5bWyBkdXJhdGlvbl9mb3JtYXR0ZWQgXV08L3NwYW4+J1xuICAgICAgKyAgICAgICc8L2xpPidcbiAgICAgICsgICAgICAnW1sgL3NvbmdzIF1dJ1xuICAgICAgKyAgICAnPC91bD4nXG4gICAgICArICAnPC9kaXY+J1xuICAgICAgKyAgJ1tbIC9wbGF5bGlzdCBdXSdcbiAgICAgICsnPC9kaXY+J1xuICB9XG5cbiAgLy8gbW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyICRjdXJyZW50X3BsYXllciA9IG51bGw7XG4gIHZhciBwbGF5T25Mb2FkID0gZmFsc2U7XG4gIHZhciBzdGFydEF0WmVybyA9IGZhbHNlO1xuXG4gIHZhciBhdWRpbyA9IG5ldyBhdWRpbzUoe1xuICAgIHN3Zl9wYXRoOiAnL2F1ZGlvNWpzL2F1ZGlvNWpzLnN3ZicsXG4gICAgZm9ybWF0X3RpbWU6IGZhbHNlLCAvLyBrZWVwIGl0IGluIHNlY29uZHMgZm9yIHdpZHRoIGNhbGN1bGF0aW9uc1xuICB9KTtcbiAgYXVkaW8ub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gIH0pO1xuICBhdWRpby5vbigncGxheScsIGZ1bmN0aW9uICgpIHtcbiAgICAkY3VycmVudF9wbGF5ZXIuZmluZCgnLm1kLXBsYXknKTtcbiAgICBjJCgnLmlzLXBsYXlpbmcnKS5yZW1vdmVDbGFzcygnaXMtcGxheWluZycpO1xuICAgICRjdXJyZW50X3BsYXllci5hZGRDbGFzcygnaXMtcGxheWluZycpO1xuICB9KTtcbiAgYXVkaW8ub24oJ3BhdXNlJywgZnVuY3Rpb24gKCkge1xuICAgICRjdXJyZW50X3BsYXllci5yZW1vdmVDbGFzcygnaXMtcGxheWluZycpO1xuICAgICRjdXJyZW50X3BsYXllci5maW5kKCcubWQtcGxheScpO1xuICB9KTtcbiAgYXVkaW8ub24oJ2NhbnBsYXknLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3RhcnRBdFplcm8pIHtcbiAgICAgIGF1ZGlvLnNlZWsoMCk7XG4gICAgICBzdGFydEF0WmVybyA9IGZhbHNlO1xuICAgIH1cbiAgICBhdWRpby5wbGF5KCk7XG4gIH0pO1xuICBhdWRpby5vbigndGltZXVwZGF0ZScsIGZ1bmN0aW9uIChwb3NpdGlvbiwgZHVyYXRpb24pIHtcbiAgICAkY3VycmVudF9wbGF5ZXIuZmluZCgnLnBsYXllZC1jb250YWluZXInKS5jc3MoJ3dpZHRoJywgKHBvc2l0aW9uL2R1cmF0aW9uKSoxMDAgKyAnJScpO1xuICAgICRjdXJyZW50X3BsYXllci5maW5kKCcuZWxhcHNlZCcpLnRleHQoc2VjX3RvX3RpbWUocG9zaXRpb24pKTtcbiAgfSk7XG4gIGF1ZGlvLm9uKCdwcm9ncmVzcycsIGZ1bmN0aW9uIChsb2FkX3BlcmNlbnQpIHtcbiAgICAkY3VycmVudF9wbGF5ZXIuZmluZCgnLmxvYWRlZC1jb250YWluZXInKS5jc3MoJ3dpZHRoJywgbG9hZF9wZXJjZW50ICsgJyUnKTtcbiAgfSk7XG4gIGF1ZGlvLm9uKCdlbmRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBwbGF5TmV4dFByZXZTb25nKCRjdXJyZW50X3BsYXllcik7XG4gIH0pO1xuICBhdWRpby5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgfSk7XG5cbiAgdmFyIGxvYWRTb25nSW5QbGF5ZXIgPSBmdW5jdGlvbihlbCwgc29uZ0lkKSB7XG5cbiAgICB2YXIgdGVtcGxhdGVfc3R5bGUgPSAgYyQoZWwpLmF0dHIoJ2RhdGEtdGVtcGxhdGUtaWQnKSB8fCAnbWQtcGxheWVyLXNjLXN0eWxlJyB8fCAnbWQtcGxheWVyLXNpbXBsZS1zdHlsZSc7XG5cbiAgICAvLyBzZXQgdGVtcGxhdGVcbiAgICB2YXIgdCA9IHRlbXBsYXRlc1t0ZW1wbGF0ZV9zdHlsZV07XG4gICAgdmFyIHBsT2Zmc2V0O1xuXG4gICAgLy8gYWRkIHN0eWxlIGNsYXNzXG4gICAgYyQoZWwpLmFkZENsYXNzKHRlbXBsYXRlX3N0eWxlKTtcblxuICAgIGpzb25wKGFwaV91cmwgKyAnc29uZy8nICsgc29uZ0lkLFxuICAgICAge1xuICAgICAgICAvLyBuYW1lOiBcInNkY2JfXCIrKERhdGUubm93KCkpXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGlmICghcmVzcCkgcmV0dXJuO1xuICAgICAgICAvLyBnZXQgZWxlbWVudCBkYXRhXG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIGRhdGEuc29uZyA9IHJlc3A7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICBkYXRhLmVsYXBzZWQgPSAnMDA6MDAnO1xuICAgICAgICAvLyBhdHRhY2ggc29uZyBkYXRhIHRvIHBsYXllciBjb250YWluZXJcbiAgICAgICAgYyQoZWwpLmRhdGEoJ3NvbmcnLCBkYXRhLnNvbmcpO1xuICAgICAgICAvLyBzZWUgaWYgcGxheWVyIGhhcyBhIGN1c3RvbSB0ZW1wbGF0ZVxuICAgICAgICBpZiAoY3RpID0gYyQoZWwpLmF0dHIoJ2RhdGEtdGVtcGxhdGUtaWQnKSkge1xuICAgICAgICAgIC8vIGVuc3VyZSBjdXN0b20gdGVtcGxhdGUgZXhpc3RzXG4gICAgICAgICAgaWYgKGMkKCcjJytjdGkpWzBdKSB7XG4gICAgICAgICAgICB0ID0gYyQoJyMnK2N0aSkuaHRtbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbmRlciB0ZW1wbGF0ZVxuICAgICAgICBkYXRhLnNvbmcuZHVyYXRpb25fZm9ybWF0dGVkID0gc2VjX3RvX3RpbWUoZGF0YS5zb25nLmR1cmF0aW9uKTtcbiAgICAgICAgLy8gY2hhciBsaW1pdCBmb3Igc29uZyB0aXRsZVxuICAgICAgICBkYXRhLnNvbmcudGl0bGUgPSAoZGF0YS5zb25nLnRpdGxlLmxlbmd0aCA+IDQwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZGF0YS5zb25nLnRpdGxlLnN1YnN0cmluZygwLCA0MCkudHJpbSgpICsgJy4uLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGRhdGEuc29uZy50aXRsZTtcblxuICAgICAgICAvLyBncmFiIHBsYXlsaXN0IGRhdGEgZnJvbSBwbGF5ZXIgY29udGFpbmVyXG4gICAgICAgIGRhdGEucGxheWxpc3QgPSBjJChlbCkuZGF0YSgncGxheWxpc3QnKTtcblxuICAgICAgICAvLyBjYXB0dXJlIHBsYXlsaXN0IHNjcm9sbCBwb3NpdGlvbiBmb3IgYWZ0ZXIgcmVuZGVyXG4gICAgICAgIGlmIChkYXRhLnBsYXlsaXN0KSB7XG4gICAgICAgICAgaWYgKGMkKGVsKS5maW5kKCcubWQtcGxheWxpc3QtY29udGFpbmVyJykuZ2V0KDApKSB7XG4gICAgICAgICAgICBwbE9mZnNldCA9IGMkKGVsKS5maW5kKCcubWQtcGxheWVyLXBsYXlsaXN0JykuZ2V0KDApLnNjcm9sbFRvcDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhlbCk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHBsYXllclxuICAgICAgICBtdXN0YWNoZS5wYXJzZSh0LCBbXCJbW1wiLCBcIl1dXCJdKTtcbiAgICAgICAgYyQoZWwpLmh0bWwobXVzdGFjaGUucmVuZGVyKHQsIGRhdGEpKTtcblxuICAgICAgICAvLyByZXNldCBwbGF5bGlzdCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgaWYgKHBsT2Zmc2V0KSB7XG4gICAgICAgICAgYyQoZWwpLmZpbmQoJy5tZC1wbGF5ZXItcGxheWxpc3QnKS5nZXQoMCkuc2Nyb2xsVG9wID0gcGxPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBzZXQgdG8gcGxheSBvbiBsb2FkXG4gICAgICAgIGlmIChwbGF5T25Mb2FkKSB7XG4gICAgICAgICAgcGxheU9uTG9hZCA9IGZhbHNlO1xuICAgICAgICAgIHN0YXJ0QXRaZXJvID0gdHJ1ZTtcbiAgICAgICAgICAkY3VycmVudF9wbGF5ZXIgPSBjJChlbCkuY2xvc2VzdCgnLm1kLXBsYXllcicpO1xuICAgICAgICAgIGF1ZGlvLmxvYWQoJ2h0dHA6JyArIGRhdGEuc29uZy5tZWRpYS5zdHJlYW1pbmcgKyAnLm1wMycpO1xuICAgICAgICAgIC8vIHRyeSB7IC8vIHRoaXMgYnJlYWtzIGluIElFIDlcbiAgICAgICAgICAvLyAgIGF1ZGlvLnNlZWsoMCk7IC8vIHdvbid0IHBsYXkgd2l0aG91dCB0aGlzIHdoZW4gc3dpdGNoaW5nIHNvbmdzIHZpYSBwbGF5L3BhdXNlXG4gICAgICAgICAgLy8gfSBjYXRjaChlKSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBnZXRzIHRoZSB3cm9uZyBudW1iZXIgb2NjYXNzaW9uYWxseSAodG8gZmFzdCB0byBsb2FkPykgYW5kIGVuZHMgdXAgcmVhbGx5IHdpZGVcbiAgICAgICAgdmFyIHdhdmVmb3JtV2lkdGggPSBjJChlbCkuZXEoMCkuZmluZCgnLndhdmVmb3JtLWNvbnRhaW5lcicpLndpZHRoKCk7XG5cbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgLy8gY2FsbGJhY2s6IFwiY2FsbGJhY2tfXCIrKERhdGUubm93KCkpLFxuICAgICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgICBmZzogXCJCRTMwMjZcIixcbiAgICAgICAgICAgIGJnOiBcIlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBiYXJfd2lkdGg6IDIsXG4gICAgICAgICAgYmFyX2dhcDogMSxcbiAgICAgICAgICBmaWxlbmFtZTogXCJ3YXZlZm9ybS5qc29uXCIsXG4gICAgICAgICAgdmVydGljYWxfYWxpZ246IGZhbHNlLFxuICAgICAgICAgIC8vIHJvdW5kOiAxLFxuICAgICAgICAgIHNvbmdfaWQ6IGRhdGEuc29uZy5pZCxcbiAgICAgICAgICBhcnRpc3Rfc2t1OiBkYXRhLnNvbmcuYXJ0aXN0LnNrdSxcbiAgICAgICAgICBjYXRhbG9nX3NsdWc6IChkYXRhLnNvbmcubWVkaWEuc3RyZWFtaW5nLnNwbGl0KCcvJykuZmlsdGVyKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYgIT09ICcnOyB9KSlbMV0sXG4gICAgICAgICAgc2l6ZToge1xuICAgICAgICAgICAgaGVpZ2h0OiA1NSxcbiAgICAgICAgICAgIHdpZHRoOiB3YXZlZm9ybVdpZHRoXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChxLnNpemUud2lkdGggPCAxKSByZXR1cm47XG4gICAgICAgIHZhciB3YXZlZm9ybVVybFBhcmFtcyA9ICc/YmFyX3dpZHRoPScrcS5iYXJfd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKycmYXJ0aXN0X3NrdT0nK3EuYXJ0aXN0X3NrdSsnJmNhdGFsb2dfc2x1Zz0nK3EuY2F0YWxvZ19zbHVnKycmYmFyX2dhcD0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICtxLmJhcl9nYXArJyZmaWxlbmFtZT0nK3EuZmlsZW5hbWUrJyZ2ZXJ0aWNhbF9hbGlnbj0nK3EudmVydGljYWxfYWxpZ25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKycmc29uZ19pZD0nK3Euc29uZ19pZCsnJnNpemU9JytxLnNpemUud2lkdGg7XG5cbiAgICAgICAganNvbnAoYXBpX3VybCArICdzb25nL3dhdmVmb3JtJyArIHdhdmVmb3JtVXJsUGFyYW1zLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIG5hbWU6IFwid3ZjYl9cIisoRGF0ZS5ub3coKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVyciwgd2F2ZURhdGEpIHtcbiAgICAgICAgICAgIGlmICghd2F2ZURhdGEpIHJldHVybjtcbiAgICAgICAgICAgIHZhciB3YXZlZm9ybURPTSA9ICc8ZGl2IGNsYXNzPVwibWQtd2YtY29udGFpbmVyXCIgc3R5bGU9XCJoZWlnaHQ6ICcgKyBxLnNpemUuaGVpZ2h0ICsgJ3B4OyB3aWR0aDogJyArIHEuc2l6ZS53aWR0aCArICdweDtcIj4nO1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPHdhdmVEYXRhLnBlYWtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciBib3R0b21fbWFyZ2luID0gKCEhcS52ZXJ0aWNhbF9hbGlnbikgPyAocS5zaXplLmhlaWdodCAtIChNYXRoLmNlaWwoKHdhdmVEYXRhLnBlYWtzW2ldKSAqIChxLnNpemUuaGVpZ2h0LzEwMCkpKSkvMiArICdweCcgOiAwO1xuICAgICAgICAgICAgICB3YXZlZm9ybURPTSArPSAnPGRpdiBjbGFzcz1cIm1kLXdmLWJhclwiIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogJyArIGJvdHRvbV9tYXJnaW4gKyAnOyB3aWR0aDogJyArIHEuYmFyX3dpZHRoICsgJ3B4OyBoZWlnaHQ6ICcgKyBNYXRoLmNlaWwoKHdhdmVEYXRhLnBlYWtzW2ldKSAqIChxLnNpemUuaGVpZ2h0LzEwMCkpICsgJ3B4OyBtYXJnaW4tbGVmdDogJyArIHEuYmFyX2dhcCArICdweDtcIj48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F2ZWZvcm1ET00gKz0gJzwvZGl2Pic7XG4gICAgICAgICAgICAvLyBhdHRhY2ggd2F2ZWZvcm0gdHdpY2UgdG8gY292ZXIgZnVsbCB3YXZlZm9ybSBhbmQgcGxheWVkIHBvcnRpb25cbiAgICAgICAgICAgIGMkKGVsKS5maW5kKCcud2F2ZWZvcm0tY29udGFpbmVyJykuaHRtbCh3YXZlZm9ybURPTSk7XG4gICAgICAgICAgICBjJChlbCkuZmluZCgnLnBsYXllZC1jb250YWluZXInKS5odG1sKHdhdmVmb3JtRE9NKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgdmFyIGxvYWRQbGF5bGlzdEluUGxheWVyID0gZnVuY3Rpb24oZWwsIHBsYXlsaXN0SWQpIHtcbiAgICBpZiAoIXBsYXlsaXN0SWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gZ2V0IGRhdGEgZm9yIHBsYXlsaXN0XG4gICAganNvbnAoYXBpX3VybCArICdwbGF5bGlzdC8nICsgcGxheWxpc3RJZCxcbiAgICAgIHtcbiAgICAgICAgLy8gbmFtZTogXCJwbGNiX1wiKyhEYXRlLm5vdygpKVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICAvLyBnZXQgZWxlbWVudCBkYXRhXG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIGRhdGEucGxheWxpc3QgPSByZXNwO1xuICAgICAgICAvLyBmb3JtYXR0ZWQgZHVyYXRpb24gZm9yIGRpc3BsYXlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnBsYXlsaXN0LnNvbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZGF0YS5wbGF5bGlzdC5zb25nc1tpXS5kdXJhdGlvbl9mb3JtYXR0ZWQgPSBzZWNfdG9fdGltZShkYXRhLnBsYXlsaXN0LnNvbmdzW2ldLmR1cmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhdHRhY2ggcGxheWxpc3QgZGF0YSB0byBwbGF5ZXIgY29udGFpbmVyXG4gICAgICAgIGMkKGVsKS5kYXRhKCdwbGF5bGlzdCcsIGRhdGEucGxheWxpc3QpO1xuICAgICAgICAvLyBzZXQgc29uZyB0byBmaXJzdCBpdGVtIGZyb20gcGxheWxpc3RcbiAgICAgICAgbG9hZFNvbmdJblBsYXllcihlbCwgZGF0YS5wbGF5bGlzdC5zb25nc1swXS5pZCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHZhciBwbGF5TmV4dFByZXZTb25nID0gZnVuY3Rpb24oZWwsIHByZXYpIHtcbiAgICBpZiAocHJldikge1xuXG4gICAgfSBlbHNlIHsgLy9uZXh0XG4gICAgICBpZiAoJGN1cnJlbnRfcGxheWVyLmhhc0NsYXNzKCdoYXMtcGxheWxpc3QnKSkge1xuICAgICAgICB2YXIgY3VycmVudFNvbmdJRCA9ICRjdXJyZW50X3BsYXllci5kYXRhKCdzb25nJykuaWQ7XG4gICAgICAgIHZhciBpdGVtcyA9ICRjdXJyZW50X3BsYXllci5maW5kKCcubWQtcGxheWxpc3QtaXRlbScpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGMkKGl0ZW1zW2ldKS5hdHRyKCdkYXRhLXNvbmctaWQnKSA9PSBjdXJyZW50U29uZ0lEICYmIGMkKGl0ZW1zW2krMV0pLmdldCgwKSkge1xuICAgICAgICAgICAgLy8gc2V0IGl0IHRvIGF1dG9wbGF5XG4gICAgICAgICAgICBwbGF5T25Mb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGxvYWQgc29uZ1xuICAgICAgICAgICAgbG9hZFNvbmdJblBsYXllcigkY3VycmVudF9wbGF5ZXIsIGMkKGl0ZW1zW2krMV0pLmF0dHIoJ2RhdGEtc29uZy1pZCcpKTtcbiAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGluaXQgY29udGFpbmVyc1xuICBjJCgnLm1kLXBsYXllcicpLmVhY2goZnVuY3Rpb24oZWwsIGlkeCkge1xuICAgIC8vIGVuc3VyZSBwbGF5ZXIgaGFzbid0IGFscmVhZHkgYmVlbiBpbml0aWFsaXplZFxuICAgICAgaWYgKCFjJChlbCkuYXR0cignZGF0YS1pbml0JykpIHtcbiAgICAgICAgaWYgKCtjJChlbCkuYXR0cignZGF0YS1wbGF5bGlzdC1pZCcpKSB7XG4gICAgICAgICAgYyQoZWwpLmFkZENsYXNzKCdoYXMtcGxheWxpc3QnKTtcbiAgICAgICAgICBsb2FkUGxheWxpc3RJblBsYXllcihlbCwgYyQoZWwpLmF0dHIoJ2RhdGEtcGxheWxpc3QtaWQnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYyQoZWwpLmF0dHIoJ2RhdGEtc29uZy1pZCcpKSB7XG4gICAgICAgICAgbG9hZFNvbmdJblBsYXllcihlbCwgYyQoZWwpLmF0dHIoJ2RhdGEtc29uZy1pZCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0aGUgZWxlbWVudCwgYWRkIGEgY2xpY2sgbGlzdGVuZXIuLi4gZm9yIEZpcmVGb3grXG4gICAgICAgIGMkKGVsKS5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY2xpY2snLCBlLnRhcmdldCwgJHByZXZfcGxheWVyLCAkY3VycmVudF9wbGF5ZXIpO1xuICAgICAgICAgIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5jbGFzc05hbWUgPT0gJ3BsYXllci1wcm9ncmVzcycpIHtcbiAgICAgICAgICB2YXIgJHByZXZfcGxheWVyID0gJGN1cnJlbnRfcGxheWVyO1xuICAgICAgICAgICRjdXJyZW50X3BsYXllciA9IGMkKHRoaXMpLmNsb3Nlc3QoJy5tZC1wbGF5ZXInKTtcbiAgICAgICAgICAgIHZhciBwID0gZS5vZmZzZXRYIC8gYyQoZS50YXJnZXQpLndpZHRoKCk7XG4gICAgICAgICAgICBpZiAoISEkcHJldl9wbGF5ZXIgJiYgJHByZXZfcGxheWVyLmRhdGEoJ3NvbmcnKS5pZCA9PSAkY3VycmVudF9wbGF5ZXIuZGF0YSgnc29uZycpLmlkKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXVkaW8uc2VlayhwICogYXVkaW8uZHVyYXRpb24pO1xuICAgICAgICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhdWRpby5sb2FkKCdodHRwOicgKyAkY3VycmVudF9wbGF5ZXIuZGF0YSgnc29uZycpLm1lZGlhLnN0cmVhbWluZyArICcubXAzJyk7XG4gICAgICAgICAgICAgIHRyeSB7IC8vIHRoaXMgY2FuIGJyZWFrIGluIElFXG4gICAgICAgICAgICAgICAgYXVkaW8uc2VlayhwICogJGN1cnJlbnRfcGxheWVyLmRhdGEoJ3NvbmcnKS5kdXJhdGlvbik7IC8vIGF1ZGlvLmR1cmF0aW9uIGlzIHRoZSBvbGQgc29uZ1xuICAgICAgICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIChlLnRhcmdldCAmJiBlLnRhcmdldC5jbGFzc05hbWUubWF0Y2goJ21kLXBsYXktcGF1c2UtaWNvbicpKSB7XG4gICAgICAgICAgLy8gICB2YXIgJHByZXZfcGxheWVyID0gJGN1cnJlbnRfcGxheWVyO1xuICAgICAgICAgIC8vICAgJGN1cnJlbnRfcGxheWVyID0gYyQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tZC1wbGF5ZXInKTtcbiAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCRwcmV2X3BsYXllciwgJGN1cnJlbnRfcGxheWVyKTtcbiAgICAgICAgICAvLyAgIC8vIGlmIHNhbWUgcGxheWVyLCBwbGF5L3BhdXNlXG4gICAgICAgICAgLy8gICBpZiAoJHByZXZfcGxheWVyICYmIGF1ZGlvLmxvYWRfcGVyY2VudCA+IDAgJiYgJHByZXZfcGxheWVyLmRhdGEoJ3NvbmcnKS5pZCA9PSAkY3VycmVudF9wbGF5ZXIuZGF0YSgnc29uZycpLmlkKSB7XG4gICAgICAgICAgLy8gICAgIGF1ZGlvLnBsYXlQYXVzZSgpO1xuICAgICAgICAgIC8vICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAgICAgc3RhcnRBdFplcm8gPSB0cnVlO1xuICAgICAgICAgIC8vICAgICAvLyBpZiBuZXcgcGxheWVyLCBsb2FkIHRyYWNrXG4gICAgICAgICAgLy8gICAgIGF1ZGlvLmxvYWQoJ2h0dHA6JyArICRjdXJyZW50X3BsYXllci5kYXRhKCdzb25nJykubWVkaWEuc3RyZWFtaW5nICsgJy5tcDMnKTtcbiAgICAgICAgICAvLyAgICAgLy8gdHJ5IHsgLy8gdGhpcyBicmVha3MgaW4gSUUgOVxuICAgICAgICAgIC8vICAgICAvLyAgIGF1ZGlvLnNlZWsoMCk7IC8vIHdvbid0IHBsYXkgd2l0aG91dCB0aGlzIHdoZW4gc3dpdGNoaW5nIHNvbmdzIHZpYSBwbGF5L3BhdXNlXG4gICAgICAgICAgLy8gICAgIC8vIH0gY2F0Y2goZSkge31cbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgLy8gaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0LmNsYXNzTmFtZSA9PSAnbWQtcGxheWxpc3QtaXRlbScpIHtcbiAgICAgICAgICAvLyAgIGlmIChjJChlLnRhcmdldCkuYXR0cignZGF0YS1zb25nLWlkJykpIHtcbiAgICAgICAgICAvLyAgICAgcGxheU9uTG9hZCA9IHRydWU7XG4gICAgICAgICAgLy8gICAgIHN0YXJ0QXRaZXJvID0gdHJ1ZTtcbiAgICAgICAgICAvLyAgICAgbG9hZFNvbmdJblBsYXllcihjJCh0aGlzKS5jbG9zZXN0KCcubWQtcGxheWVyJyksIGMkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXNvbmctaWQnKSk7XG4gICAgICAgICAgLy8gICB9XG4gICAgICAgICAgLy8gfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhdHRhY2ggZXZlbnRzXG4gICAgICAgIC8vIHRoZXNlIG5lZWQgdG8gYmUgZWxlbWVudCBzcGVjaWZpYyB0byBhdm9pZCBtdWx0aXBsZSBiaW5kcyBvbiBhbiBlbGVtZW50XG4gICAgICAgIGMkKGVsKS5vbignY2xpY2snLCAnLm1kLXBsYXknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHByZXZfcGxheWVyID0gJGN1cnJlbnRfcGxheWVyO1xuICAgICAgICAgICRjdXJyZW50X3BsYXllciA9IGMkKHRoaXMpLmNsb3Nlc3QoJy5tZC1wbGF5ZXInKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygkcHJldl9wbGF5ZXIsJGN1cnJlbnRfcGxheWVyKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLCAkcHJldl9wbGF5ZXIuZGF0YSgnc29uZycpLmlkLCAkY3VycmVudF9wbGF5ZXIuZGF0YSgnc29uZycpLmlkKVxuICAgICAgICAgIC8vIGlmIHNhbWUgcGxheWVyLCBwbGF5L3BhdXNlXG4gICAgICAgICAgaWYgKCEhJHByZXZfcGxheWVyICYmICRwcmV2X3BsYXllci5kYXRhKCdzb25nJykuaWQgPT0gJGN1cnJlbnRfcGxheWVyLmRhdGEoJ3NvbmcnKS5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYXVkaW8ucGxheVBhdXNlKCk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIG5ldyBwbGF5ZXIsIGxvYWQgdHJhY2tcbiAgICAgICAgICAgIHN0YXJ0QXRaZXJvID0gdHJ1ZTtcbiAgICAgICAgICAgIGF1ZGlvLmxvYWQoJ2h0dHA6JyArICRjdXJyZW50X3BsYXllci5kYXRhKCdzb25nJykubWVkaWEuc3RyZWFtaW5nICsgJy5tcDMnKTtcbiAgICAgICAgICB9XG4gICAgICAgIC8vIGhhbmRsZSBwbGF5bGlzdCBjbGlja3NcbiAgICAgICAgfSkub24oJ2NsaWNrJywgJy5tZC1wbGF5bGlzdC1pdGVtJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGMkKHRoaXMpLmF0dHIoJ2RhdGEtc29uZy1pZCcpKSB7XG4gICAgICAgICAgICBwbGF5T25Mb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXJ0QXRaZXJvID0gdHJ1ZTtcbiAgICAgICAgICAgIGxvYWRTb25nSW5QbGF5ZXIoYyQodGhpcykuY2xvc2VzdCgnLm1kLXBsYXllcicpLCBjJCh0aGlzKS5hdHRyKCdkYXRhLXNvbmctaWQnKSk7XG4gICAgICAgICAgfVxuICAgICAgICAvLyBoYW5kbGUgY2xpY2tzIG9uIHByb2dyZXNzIGJhclxuICAgICAgICB9KS5vbignY2xpY2snLCAnLnBsYXllci1wcm9ncmVzcycsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgIC8vID09PSByZW1vdmVkIHNvIGZpcmVmb3ggd291bGQgd29yayA9PT1cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIHZhciAkcHJldl9wbGF5ZXIgPSAkY3VycmVudF9wbGF5ZXI7XG4gICAgICAgICAgLy8gJGN1cnJlbnRfcGxheWVyID0gYyQodGhpcykuY2xvc2VzdCgnLm1kLXBsYXllcicpO1xuICAgICAgICAgIC8vIC8vIGNvbnNvbGUubG9nKHdpbmRvdy5ldmVudCk7XG4gICAgICAgICAgLy8gdmFyIHAgPSAwO1xuICAgICAgICAgIC8vIC8vIGlmICh3aW5kb3cuZXZlbnQpIHtcbiAgICAgICAgICAvLyAvLyAgIHAgPSBldmVudC5vZmZzZXRYIC8gYyQodGhpcykud2lkdGgoKTtcbiAgICAgICAgICAvLyAvLyB9IGVsc2Uge1xuICAgICAgICAgIC8vICAgLy8gdmFyIG1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgICAgLy8gICB2YXIgdGhpc1ggPSBjJCh0aGlzKS5nZXQoMCkub2Zmc2V0TGVmdDtcbiAgICAgICAgICAvLyAgIHZhciBwYXJlbnRYID0gYyQodGhpcykucGFyZW50KCkuZ2V0KDApLm9mZnNldExlZnQ7XG4gICAgICAgICAgLy8gICBjb25zb2xlLmxvZyhjJCh0aGlzKSwgdGhpc1gsIHBhcmVudFgsIGV2dCk7XG4gICAgICAgICAgLy8gICAvLyBjb25zb2xlLmxvZyhldmVudC5vZmZzZXRYIC8gYyQodGhpcykud2lkdGgoKSwgKG1vdXNlWC10aGlzWCkgLyBjJCh0aGlzKS53aWR0aCgpKTtcbiAgICAgICAgICAvLyAvLyB9XG4gICAgICAgICAgLy8gaWYgKCRwcmV2X3BsYXllciAmJiAkcHJldl9wbGF5ZXIuZGF0YSgnc29uZycpLmlkID09ICRjdXJyZW50X3BsYXllci5kYXRhKCdzb25nJykuaWQpIHtcbiAgICAgICAgICAvLyAgIC8vIHRyeSB7XG4gICAgICAgICAgLy8gICAgIGF1ZGlvLnNlZWsocCAqIGF1ZGlvLmR1cmF0aW9uKTtcbiAgICAgICAgICAvLyAgIC8vIH0gY2F0Y2goZSkge31cbiAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgIC8vICAgYXVkaW8ubG9hZCgnaHR0cDonICsgJGN1cnJlbnRfcGxheWVyLmRhdGEoJ3NvbmcnKS5tZWRpYS5zdHJlYW1pbmcgKyAnLm1wMycpO1xuICAgICAgICAgIC8vICAgdHJ5IHsgLy8gdGhpcyBicmVha3MgaW4gSUVcbiAgICAgICAgICAvLyAgICAgYXVkaW8uc2VlayhwICogJGN1cnJlbnRfcGxheWVyLmRhdGEoJ3NvbmcnKS5kdXJhdGlvbik7IC8vIGF1ZGlvLmR1cmF0aW9uIGlzIHRoZSBvbGQgc29uZ1xuICAgICAgICAgIC8vICAgfSBjYXRjaChlKSB7fVxuICAgICAgICAgIC8vIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc2V0IHRvIHRydWUgdG8gYXZvaWQgcmUtaW5pdGlhbGl6aW5nIGFuIGV4aXN0aW5nIHBsYXllciBpZiBqcyBpbmNsdWRlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICBjJChlbCkuYXR0cignZGF0YS1pbml0JywgdHJ1ZSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRjdXJyZW50X3BsYXllcik7XG5cbiAgICAgIH07XG5cbiAgfSk7XG5cbiAgLy8gfSgpKTtcblxufSk7XG4iLCIvKiFcbiAqIEF1ZGlvNWpzOiBIVE1MNSBBdWRpbyBDb21wYXRpYmlsaXR5IExheWVyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vem9oYXJhcmFkL2F1ZGlvNWpzXG4gKiBMaWNlbnNlIE1JVCAoYykgWm9oYXIgQXJhZCAyMDEzXG4gKi9cbihmdW5jdGlvbiAoJHdpbiwgbnMsIGZhY3RvcnkpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIC8qZ2xvYmFsIGRlZmluZSAqL1xuICAvKmdsb2JhbCBzd2ZvYmplY3QgKi9cblxuICBpZiAodHlwZW9mIChtb2R1bGUpICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgeyAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShucywgJHdpbik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIChkZWZpbmUpID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHsgLy8gQU1EXG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KG5zLCAkd2luKTtcbiAgICB9KTtcbiAgfSBlbHNlIHsgLy8gPHNjcmlwdD5cbiAgICAkd2luW25zXSA9IGZhY3RvcnkobnMsICR3aW4pO1xuICB9XG5cbn0od2luZG93LCAnQXVkaW81anMnLCBmdW5jdGlvbiAobnMsICR3aW4pIHtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgQWN0aXZlWE9iamVjdCA9ICR3aW4uQWN0aXZlWE9iamVjdDtcblxuICAvKipcbiAgICogQXVkaW9FcnJvciBDbGFzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBlcnJvciBtZXNzYWdlXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gQXVkaW9FcnJvcihtZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxuXG4gIEF1ZGlvRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbiAgLyoqXG4gICAqIENsb25lcyBhbiBvYmplY3RcbiAgICogQHBhcmFtIG9iaiBvYmplY3QgdG8gY2xvbmVcbiAgICogQHJldHVybiB7T2JqZWN0fSBjbG9uZWQgb2JqZWN0XG4gICAqL1xuICBmdW5jdGlvbiBjbG9uZU9iamVjdChvYmopIHtcbiAgICB2YXIgY2xvbmUgPSB7fSwgaTtcbiAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIChvYmpbaV0pID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGNsb25lW2ldID0gY2xvbmVPYmplY3Qob2JqW2ldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsb25lW2ldID0gb2JqW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogRXh0ZW5kIGFuIG9iamVjdCB3aXRoIGEgbWl4aW5cbiAgICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCB0YXJnZXQgb2JqZWN0IHRvIGV4dGVuZFxuICAgKiBAcGFyYW0ge09iamVjdH0gbWl4aW4gb2JqZWN0IHRvIG1peCBpbnRvIHRhcmdldFxuICAgKiBAcmV0dXJuIHsqfSBleHRlbmRlZCBvYmplY3RcbiAgICovXG4gIHZhciBleHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBuYW1lLCBtID0gY2xvbmVPYmplY3QobWl4aW4pO1xuICAgIGZvciAobmFtZSBpbiBtKSB7XG4gICAgICBpZiAobS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICB0YXJnZXRbbmFtZV0gPSBtW25hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeHRlbmQgYW4gb2JqZWN0J3MgcHJvdG90eXBlIHdpdGggYSBtaXhpblxuICAgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IHRhcmdldCBvYmplY3QgdG8gZXh0ZW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtaXhpbiBvYmplY3QgdG8gbWl4IGludG8gdGFyZ2V0XG4gICAqIEByZXR1cm4geyp9IGV4dGVuZGVkIG9iamVjdFxuICAgKi9cbiAgdmFyIGluY2x1ZGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHJldHVybiBleHRlbmQodGFyZ2V0LnByb3RvdHlwZSwgbWl4aW4pO1xuICB9O1xuXG4gIHZhciBQdWJzdWIgPSB7XG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIGV2ZW50IG9uIGEgY2hhbm5lbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldnQgbmFtZSBvZiBjaGFubmVsIC8gZXZlbnQgdG8gc3Vic2NyaWJlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgb24gbWVzc2FnZSBwdWJsaXNoaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGN0eCB0aGUgY29udGV4dCBpbiB3aGljaCB0aGUgY2FsbGJhY2sgc2hvdWxkIGJlIGV4ZWN1dGVkXG4gICAgICovXG4gICAgb246IGZ1bmN0aW9uIChldnQsIGZuLCBjdHgpIHtcbiAgICAgIHRoaXMuc3Vic2NyaWJlKGV2dCwgZm4sIGN0eCwgZmFsc2UpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIGEgb25lLXRpbWUgZXZlbnQgb24gYSBjaGFubmVsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2dCBuYW1lIG9mIGNoYW5uZWwgLyBldmVudCB0byBzdWJzY3JpYmVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0aGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSBvbiBtZXNzYWdlIHB1Ymxpc2hpbmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY3R4IHRoZSBjb250ZXh0IGluIHdoaWNoIHRoZSBjYWxsYmFjayBzaG91bGQgYmUgZXhlY3V0ZWRcbiAgICAgKi9cbiAgICBvbmU6IGZ1bmN0aW9uKGV2dCwgZm4sIGN0eCkge1xuICAgICAgdGhpcy5zdWJzY3JpYmUoZXZ0LCBmbiwgY3R4LCB0cnVlKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVuc3Vic2NyaWJlIGZyb20gYW4gZXZlbnQgb24gYSBjaGFubmVsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2dCBuYW1lIG9mIGNoYW5uZWwgLyBldmVudCB0byB1bnN1YnNjcmliZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIHRoZSBjYWxsYmFjayB1c2VkIHdoZW4gc3Vic2NyaWJpbmcgdG8gdGhlIGV2ZW50XG4gICAgICovXG4gICAgb2ZmOiBmdW5jdGlvbiAoZXZ0LCBmbikge1xuICAgICAgaWYgKHRoaXMuY2hhbm5lbHNbZXZ0XSA9PT0gdW5kZWZpbmVkKSB7IHJldHVybjsgfVxuICAgICAgdmFyIGksIGw7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gdGhpcy5jaGFubmVsc1tldnRdLmxlbmd0aDsgaSAgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHN1YiA9IHRoaXMuY2hhbm5lbHNbZXZ0XVtpXS5mbjtcbiAgICAgICAgaWYgKHN1YiA9PT0gZm4pIHtcbiAgICAgICAgICB0aGlzLmNoYW5uZWxzW2V2dF0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBZGQgZXZlbnQgc3Vic2NyaXB0aW9uIHRvIGNoYW5uZWwuIENhbGxlZCBieSBgb25gIGFuZCBgb25lYFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldnQgbmFtZSBvZiBjaGFubmVsIC8gZXZlbnQgdG8gc3Vic2NyaWJlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gdGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgb24gbWVzc2FnZSBwdWJsaXNoaW5nXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGN0eCB0aGUgY29udGV4dCBpbiB3aGljaCB0aGUgY2FsbGJhY2sgc2hvdWxkIGJlIGV4ZWN1dGVkXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBvbmNlIGluZGljYXRlIGlmIGV2ZW50IHNob3VsZCBiZSB0cmlnZ2VyZWQgb25jZSBvciBub3RcbiAgICAgKi9cbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChldnQsIGZuLCBjdHgsIG9uY2UpIHtcbiAgICAgIGlmICh0aGlzLmNoYW5uZWxzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jaGFubmVscyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5jaGFubmVsc1tldnRdID0gdGhpcy5jaGFubmVsc1tldnRdIHx8IFtdO1xuICAgICAgdGhpcy5jaGFubmVsc1tldnRdLnB1c2goe2ZuOiBmbiwgY3R4OiBjdHgsIG9uY2U6IChvbmNlIHx8IGZhbHNlKX0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUHVibGlzaCBhIG1lc3NhZ2Ugb24gYSBjaGFubmVsLiBBY2NlcHRzICoqYXJncyoqIGFmdGVyIGV2ZW50IG5hbWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZ0IG5hbWUgb2YgY2hhbm5lbCAvIGV2ZW50IHRvIHRyaWdnZXJcbiAgICAgKi9cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICBpZiAodGhpcy5jaGFubmVscyAmJiB0aGlzLmNoYW5uZWxzLmhhc093blByb3BlcnR5KGV2dCkpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICB2YXIgYSA9IFtdO1xuICAgICAgICB3aGlsZSh0aGlzLmNoYW5uZWxzW2V2dF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBzdWIgPSB0aGlzLmNoYW5uZWxzW2V2dF0uc2hpZnQoKTtcbiAgICAgICAgICBpZiAodHlwZW9mIChzdWIuZm4pID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzdWIuZm4uYXBwbHkoc3ViLmN0eCwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggIXN1Yi5vbmNlICl7XG4gICAgICAgICAgICBhLnB1c2goc3ViKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGFubmVsc1tldnRdID0gYTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogRmxhc2ggZW1iZWQgY29kZSBzdHJpbmcgd2l0aCBjcm9zcy1icm93c2VyIHN1cHBvcnQuXG4gICAgICovXG4gIGZsYXNoX2VtYmVkX2NvZGU6IGZ1bmN0aW9uIChpZCwgc3dmX2xvY2F0aW9uLCB0cykge1xuICAgICAgdmFyIHByZWZpeDtcbiAgICAgIHZhciBzID0gJzxwYXJhbSBuYW1lPVwibW92aWVcIiB2YWx1ZT1cIicgKyBzd2ZfbG9jYXRpb24gKyAnP3BsYXllckluc3RhbmNlPXdpbmRvdy4nICsgbnMgKyAnX2ZsYXNoLmluc3RhbmNlc1tcXCcnICsgaWQgKyAnXFwnXSZkYXRldGltZT0nICsgdHMgKyAnXCIvPicgK1xuICAgICAgICAnPHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwidHJhbnNwYXJlbnRcIi8+JyArXG4gICAgICAgICc8cGFyYW0gbmFtZT1cImFsbG93c2NyaXB0YWNjZXNzXCIgdmFsdWU9XCJhbHdheXNcIiAvPicgK1xuICAgICAgICAnPC9vYmplY3Q+JztcbiAgICAgIGlmIChBY3RpdmVYT2JqZWN0KSB7XG4gICAgICAgIHByZWZpeCA9ICc8b2JqZWN0IGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiB3aWR0aD1cIjFcIiBoZWlnaHQ9XCIxXCIgaWQ9XCInICsgaWQgKyAnXCI+JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZWZpeCA9ICc8b2JqZWN0IHR5cGU9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiIGRhdGE9XCInICsgc3dmX2xvY2F0aW9uICsgJz9wbGF5ZXJJbnN0YW5jZT13aW5kb3cuJyArIG5zICsgJ19mbGFzaC5pbnN0YW5jZXNbXFwnJyArIGlkICsgJ1xcJ10mZGF0ZXRpbWU9JyArIHRzICsgJ1wiIHdpZHRoPVwiMVwiIGhlaWdodD1cIjFcIiBpZD1cIicgKyBpZCArICdcIiA+JztcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVmaXggKyBzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYnJvd3NlciBzdXBwb3J0cyBhdWRpbyBtaW1lIHR5cGUuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1pbWVfdHlwZSBhdWRpbyBtaW1lIHR5cGUgdG8gY2hlY2tcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB3aGV0aGVyIGJyb3dzZXIgc3VwcG9ydHMgcGFzc2VkIGF1ZGlvIG1pbWUgdHlwZVxuICAgICAqL1xuICAgIGNhbl9wbGF5OiBmdW5jdGlvbiAobWltZV90eXBlKSB7XG4gICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG4gICAgICB2YXIgbWltZV9zdHI7XG4gICAgICBzd2l0Y2ggKG1pbWVfdHlwZSkge1xuICAgICAgICBjYXNlICdtcDMnOlxuICAgICAgICAgIG1pbWVfc3RyID0gJ2F1ZGlvL21wZWc7JztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndm9yYmlzJzpcbiAgICAgICAgICBtaW1lX3N0ciA9ICdhdWRpby9vZ2c7IGNvZGVjcz1cInZvcmJpc1wiJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb3B1cyc6XG4gICAgICAgICAgbWltZV9zdHIgPSAnYXVkaW8vb2dnOyBjb2RlY3M9XCJvcHVzXCInO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWJtJzpcbiAgICAgICAgICBtaW1lX3N0ciA9ICdhdWRpby93ZWJtOyBjb2RlY3M9XCJ2b3JiaXNcIic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21wNCc6XG4gICAgICAgICAgbWltZV9zdHIgPSAnYXVkaW8vbXA0OyBjb2RlY3M9XCJtcDRhLjQwLjVcIic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dhdic6XG4gICAgICAgICAgbWltZV9zdHIgPSAnYXVkaW8vd2F2OyBjb2RlY3M9XCIxXCInO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKG1pbWVfc3RyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG1pbWVfdHlwZSA9PT0gJ21wMycgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKSAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9GaXJlZm94L2kpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhYS5jYW5QbGF5VHlwZSAmJiBhLmNhblBsYXlUeXBlKG1pbWVfc3RyKSAhPT0gJyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCb29sZWFuIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicm93c2VyIGhhcyBGbGFzaCBpbnN0YWxsZWQgb3Igbm90XG4gICAgICovXG4gICAgaGFzX2ZsYXNoOiAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHIgPSBmYWxzZTtcbiAgICAgIGlmIChuYXZpZ2F0b3IucGx1Z2lucyAmJiBuYXZpZ2F0b3IucGx1Z2lucy5sZW5ndGggJiYgbmF2aWdhdG9yLnBsdWdpbnNbJ1Nob2Nrd2F2ZSBGbGFzaCddKSB7XG4gICAgICAgIHIgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzICYmIG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBtaW1lVHlwZSA9IG5hdmlnYXRvci5taW1lVHlwZXNbJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJ107XG4gICAgICAgIHIgPSBtaW1lVHlwZSAmJiBtaW1lVHlwZS5lbmFibGVkUGx1Z2luO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgYXggPSBuZXcgQWN0aXZlWE9iamVjdCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcbiAgICAgICAgICByID0gdHlwZW9mIChheCkgPT09ICdvYmplY3QnO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfSgpKSxcbiAgICAvKipcbiAgICAgKiBFbWJlZCBGbGFzaCBNUDMgcGxheWVyIFNXRiB0byBET01cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3dmX2xvY2F0aW9uIGxvY2F0aW9uIG9mIE1QMyBwbGF5ZXIgU1dGXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIHN3ZiB1bmlxdWUgSUQgdXNlZCBmb3IgcmVzb2x2aW5nIGNhbGxiYWNrcyBmcm9tIEV4dGVybmFsSW50ZXJmYWNlIHRvIEphdmFzY3JpcHRcbiAgICAgKi9cbiAgICBlbWJlZEZsYXNoOiBmdW5jdGlvbiAoc3dmX2xvY2F0aW9uLCBpZCkge1xuICAgICAgdmFyIGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgZC5zdHlsZS53aWR0aCA9ICcxcHgnO1xuICAgICAgZC5zdHlsZS5oZWlnaHQgPSAnMXB4JztcbiAgICAgIGQuc3R5bGUudG9wID0gJzFweCc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGQpO1xuICAgICAgaWYodHlwZW9mKCR3aW4uc3dmb2JqZWN0KSA9PT0gJ29iamVjdCcpe1xuICAgICAgICB2YXIgZnYgPSB7XG4gICAgICAgICAgcGxheWVySW5zdGFuY2U6ICd3aW5kb3cuJysgbnMgKyAnX2ZsYXNoLmluc3RhbmNlc1tcXCcnK2lkKydcXCddJ1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgIGFsbG93c2NyaXB0YWNjZXNzOiAnYWx3YXlzJyxcbiAgICAgICAgICB3bW9kZTogJ3RyYW5zcGFyZW50J1xuICAgICAgICB9O1xuICAgICAgICBkLmlubmVySFRNTCA9ICc8ZGl2IGlkPVwiJytpZCsnXCI+PC9kaXY+JztcbiAgICAgICAgc3dmb2JqZWN0LmVtYmVkU1dGKHN3Zl9sb2NhdGlvbiArICc/dHM9JysobmV3IERhdGUoKS5nZXRUaW1lKCkgKyBNYXRoLnJhbmRvbSgpKSwgaWQsIFwiMVwiLCBcIjFcIiwgXCI5LjAuMFwiLCBudWxsLCBmdiwgcGFyYW1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0cyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgTWF0aC5yYW5kb20oKTsgLy8gRW5zdXJlIHN3ZiBpcyBub3QgcHVsbGVkIGZyb20gY2FjaGVcbiAgICAgICAgZC5pbm5lckhUTUwgPSB0aGlzLmZsYXNoX2VtYmVkX2NvZGUoaWQsIHN3Zl9sb2NhdGlvbiwgdHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEZvcm1hdHMgc2Vjb25kcyBpbnRvIGEgdGltZSBzdHJpbmcgaGg6bW06c3MuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNlY29uZHMgc2Vjb25kcyB0byBmb3JtYXQgYXMgc3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfSBmb3JtYXR0ZWQgdGltZSBzdHJpbmdcbiAgICAgKi9cbiAgICBmb3JtYXRUaW1lOiBmdW5jdGlvbiAoc2Vjb25kcykge1xuICAgICAgdmFyIGhvdXJzID0gcGFyc2VJbnQoc2Vjb25kcyAvIDM2MDAsIDEwKSAlIDI0O1xuICAgICAgdmFyIG1pbnV0ZXMgPSBwYXJzZUludChzZWNvbmRzIC8gNjAsIDEwKSAlIDYwO1xuICAgICAgdmFyIHNlY3MgPSBwYXJzZUludChzZWNvbmRzICUgNjAsIDEwKTtcbiAgICAgIHZhciByZXN1bHQsIGZyYWdtZW50ID0gKG1pbnV0ZXMgPCAxMCA/IFwiMFwiICsgbWludXRlcyA6IG1pbnV0ZXMpICsgXCI6XCIgKyAoc2VjcyAgPCAxMCA/IFwiMFwiICsgc2VjcyA6IHNlY3MpO1xuICAgICAgaWYgKGhvdXJzID4gMCkge1xuICAgICAgICByZXN1bHQgPSAoaG91cnMgPCAxMCA/IFwiMFwiICsgaG91cnMgOiBob3VycykgKyBcIjpcIiArIGZyYWdtZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gZnJhZ21lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcblxuICB1dGlsLnVzZV9mbGFzaCA9IHV0aWwuY2FuX3BsYXkoJ21wMycpO1xuXG4gIHZhciBBdWRpbzVqcywgRmxhc2hBdWRpb1BsYXllciwgSFRNTDVBdWRpb1BsYXllcjtcblxuICAvKipcbiAgICogQ29tbW9uIGF1ZGlvIGF0dHJpYnV0ZXMgb2JqZWN0LiBNaXhlZCBpbnRvIGF1ZGlvIHBsYXllcnMuXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB2YXIgQXVkaW9BdHRyaWJ1dGVzID0ge1xuICAgIHBsYXlpbmc6IGZhbHNlLCAvKioge0Jvb2xlYW59IHBsYXllciBwbGF5YmFjayBzdGF0ZSAgKi9cbiAgICB2b2w6IDEsIC8qKiB7RmxvYXR9IGF1ZGlvIHZvbHVtZSAqL1xuICAgIGR1cmF0aW9uOiAwLCAvKioge0Zsb2F0fSBhdWRpbyBkdXJhdGlvbiAoc2VjKSAqL1xuICAgIHBvc2l0aW9uOiAwLCAvKioge0Zsb2F0fSBhdWRpbyBwb3NpdGlvbiAoc2VjKSAqL1xuICAgIGxvYWRfcGVyY2VudDogMCwgLyoqIHtGbG9hdH0gYXVkaW8gZmlsZSBsb2FkIHBlcmNlbnQgKCUpICovXG4gICAgc2Vla2FibGU6IGZhbHNlLCAvKioge0Jvb2xlYW59IGlzIGxvYWRlZCBhdWRpbyBzZWVrYWJsZSAqL1xuICAgIHJlYWR5OiBudWxsIC8qKiB7Qm9vbGVhbn0gaXMgbG9hZGVkIGF1ZGlvIHNlZWthYmxlICovXG4gIH07XG5cbiAgLyoqXG4gICAqIEdsb2JhbCBvYmplY3QgaG9sZGluZyBmbGFzaC1iYXNlZCBwbGF5ZXIgaW5zdGFuY2VzLlxuICAgKiBVc2VkIHRvIGNyZWF0ZSBhIGJyaWRnZSBiZXR3ZWVuIEZsYXNoJ3MgRXh0ZXJuYWxJbnRlcmZhY2UgY2FsbHMgYW5kIEZsYXNoQXVkaW9QbGF5ZXIgaW5zdGFuY2VzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB2YXIgZ2xvYmFsQXVkaW81Rmxhc2ggPSAkd2luW25zICsgJ19mbGFzaCddID0gJHdpbltucyArICdfZmxhc2gnXSB8fCB7XG4gICAgaW5zdGFuY2VzOiB7IH0sIC8qKiBGbGFzaEF1ZGlvUGxheWVyIGluc3RhbmNlIGhhc2ggKi9cbiAgICBjb3VudDogMCAvKiogRmxhc2hBdWRpb1BsYXllciBpbnN0YW5jZSBjb3VudCAqL1xuICB9O1xuXG4gIC8qKlxuICAgKiBGbGFzaCBNUDMgQXVkaW8gUGxheWVyIENsYXNzXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgRmxhc2hBdWRpb1BsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXRpbC51c2VfZmxhc2ggJiYgIXV0aWwuaGFzX2ZsYXNoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZsYXNoIFBsdWdpbiBNaXNzaW5nJyk7XG4gICAgfVxuICB9O1xuXG4gIEZsYXNoQXVkaW9QbGF5ZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHBsYXllclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzd2Zfc3JjIHBhdGggdG8gYXVkaW8gcGxheWVyIFNXRiBmaWxlXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24gKHN3Zl9zcmMpIHtcbiAgICAgIGdsb2JhbEF1ZGlvNUZsYXNoLmNvdW50ICs9IDE7XG4gICAgICB0aGlzLmlkID0gbnMgKyBnbG9iYWxBdWRpbzVGbGFzaC5jb3VudDtcbiAgICAgIGdsb2JhbEF1ZGlvNUZsYXNoLmluc3RhbmNlc1t0aGlzLmlkXSA9IHRoaXM7XG4gICAgICB0aGlzLmVtYmVkKHN3Zl9zcmMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRW1iZWQgYXVkaW8gcGxheWVyIFNXRiBpbiBwYWdlIGFuZCBhc3NpZ24gcmVmZXJlbmNlIHRvIGF1ZGlvIGluc3RhbmNlIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN3Zl9zcmMgcGF0aCB0byBhdWRpbyBwbGF5ZXIgU1dGIGZpbGVcbiAgICAgKi9cbiAgICBlbWJlZDogZnVuY3Rpb24gKHN3Zl9zcmMpIHtcbiAgICAgIHV0aWwuZW1iZWRGbGFzaChzd2Zfc3JjLCB0aGlzLmlkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEV4dGVybmFsSW50ZXJmYWNlIGNhbGxiYWNrIGluZGljYXRpbmcgU1dGIGlzIHJlYWR5XG4gICAgICovXG4gICAgZWlSZWFkeTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hdWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuICAgICAgdGhpcy50cmlnZ2VyKCdyZWFkeScpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRXh0ZXJuYWxJbnRlcmZhY2UgYXVkaW8gbG9hZCBzdGFydGVkIGNhbGxiYWNrLiBGaXJlcyB3aGVuIGF1ZGlvIHN0YXJ0cyBsb2FkaW5nLlxuICAgICAqL1xuICAgIGVpTG9hZFN0YXJ0OiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50cmlnZ2VyKCdsb2Fkc3RhcnQnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEV4dGVybmFsSW50ZXJmYWNlIGF1ZGlvIG1ldGFkYXRhIGxvYWRlZCBjYWxsYmFjay4gRmlyZXMgd2hlbiBhdWRpbyBJRDMgdGFncyBoYXZlIGJlZW4gbG9hZGVkLlxuICAgICAqL1xuICAgIGVpTG9hZGVkTWV0YWRhdGE6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2xvYWRlZG1ldGFkYXRhJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBhdWRpbyBjYW4gcGxheSBjYWxsYmFjay4gRmlyZXMgd2hlbiBhdWRpbyBjYW4gYmUgcGxheWVkLlxuICAgICAqL1xuICAgIGVpQ2FuUGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdjYW5wbGF5Jyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSB0aW1ldXBkYXRlIGNhbGxiYWNrLiBGaXJlcyBhcyBsb25nIGFzIHBsYXloZWFkIHBvc2l0aW9uIGlzIHVwZGF0ZWQgKGF1ZGlvIGlzIGJlaW5nIHBsYXllZCkuXG4gICAgICogQHBhcmFtIHtGbG9hdH0gcG9zaXRpb24gYXVkaW8gcGxheWJhY2sgcG9zaXRpb24gKHNlYylcbiAgICAgKiBAcGFyYW0ge0Zsb2F0fSBkdXJhdGlvbiBhdWRpbyB0b3RhbCBkdXJhdGlvbiAoc2VjKVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gc2Vla2FibGUgaXMgYXVkaW8gc2Vla2FibGUgb3Igbm90IChkb3dubG9hZCBvciBzdHJlYW1pbmcpXG4gICAgICovXG4gICAgZWlUaW1lVXBkYXRlOiBmdW5jdGlvbiAocG9zaXRpb24sIGR1cmF0aW9uLCBzZWVrYWJsZSkge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgdGhpcy5zZWVrYWJsZSA9IHNlZWthYmxlO1xuICAgICAgdGhpcy50cmlnZ2VyKCd0aW1ldXBkYXRlJywgcG9zaXRpb24sICh0aGlzLnNlZWthYmxlID8gZHVyYXRpb24gOiBudWxsKSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBkb3dubG9hZCBwcm9ncmVzcyBjYWxsYmFjay4gRmlyZXMgYXMgbG9uZyBhcyBhdWRpbyBmaWxlIGlzIGRvd25sb2FkZWQgYnkgYnJvd3Nlci5cbiAgICAgKiBAcGFyYW0ge0Zsb2F0fSBwZXJjZW50IGF1ZGlvIGRvd25sb2FkIHBlcmNlbnRcbiAgICAgKiBAcGFyYW0ge0Zsb2F0fSBkdXJhdGlvbiBhdWRpbyB0b3RhbCBkdXJhdGlvbiAoc2VjKVxuICAgICAqICogQHBhcmFtIHtCb29sZWFufSBzZWVrYWJsZSBpcyBhdWRpbyBzZWVrYWJsZSBvciBub3QgKGRvd25sb2FkIG9yIHN0cmVhbWluZylcbiAgICAgKi9cbiAgICBlaVByb2dyZXNzOiBmdW5jdGlvbiAocGVyY2VudCwgZHVyYXRpb24sIHNlZWthYmxlKSB7XG4gICAgICB0aGlzLmxvYWRfcGVyY2VudCA9IHBlcmNlbnQ7XG4gICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICB0aGlzLnNlZWthYmxlID0gc2Vla2FibGU7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3Byb2dyZXNzJywgcGVyY2VudCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBhdWRpbyBsb2FkIGVycm9yIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtc2cgZXJyb3IgbWVzc2FnZVxuICAgICAqL1xuICAgIGVpTG9hZEVycm9yOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2Vycm9yJywgbXNnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEV4dGVybmFsSW50ZXJmYWNlIGF1ZGlvIHBsYXkgY2FsbGJhY2suIEZpcmVzIHdoZW4gYXVkaW8gc3RhcnRzIHBsYXlpbmcuXG4gICAgICovXG4gICAgZWlQbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgdGhpcy50cmlnZ2VyKCdwbGF5Jyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBhdWRpbyBwYXVzZSBjYWxsYmFjay4gRmlyZXMgd2hlbiBhdWRpbyBpcyBwYXVzZWQuXG4gICAgICovXG4gICAgZWlQYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3BhdXNlJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBhdWRpbyBlbmRlZCBjYWxsYmFjay4gRmlyZXMgd2hlbiBhdWRpbyBwbGF5YmFjayBlbmRlZC5cbiAgICAgKi9cbiAgICBlaUVuZGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2VuZGVkJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHRlcm5hbEludGVyZmFjZSBhdWRpbyBzZWVraW5nIGNhbGxiYWNrLiBGaXJlcyB3aGVuIGF1ZGlvIGlzIGJlaW5nIHNlZWtlZC5cbiAgICAgKi9cbiAgICBlaVNlZWtpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3NlZWtpbmcnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEV4dGVybmFsSW50ZXJmYWNlIGF1ZGlvIHNlZWtlZCBjYWxsYmFjay4gRmlyZXMgd2hlbiBhdWRpbyBoYXMgYmVlbiBzZWVrZWQuXG4gICAgICovXG4gICAgZWlTZWVrZWQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3NlZWtlZCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVzZXRzIGF1ZGlvIHBvc2l0aW9uIGFuZCBwYXJhbWV0ZXJzLiBJbnZva2VkIG9uY2UgYXVkaW8gaXMgbG9hZGVkLlxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlZWthYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmR1cmF0aW9uID0gMDtcbiAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgdGhpcy5sb2FkX3BlcmNlbnQgPSAwO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTG9hZCBhdWRpbyBmcm9tIHVybC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFVSTCBvZiBhdWRpbyB0byBsb2FkXG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24gKHVybCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgdGhpcy5hdWRpby5sb2FkKHVybCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQbGF5IGF1ZGlvXG4gICAgICovXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hdWRpby5wcGxheSgpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUGF1c2UgYXVkaW9cbiAgICAgKi9cbiAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hdWRpby5wcGF1c2UoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCAvIFNldCBhdWRpbyB2b2x1bWVcbiAgICAgKiBAcGFyYW0ge0Zsb2F0fSB2IGF1ZGlvIHZvbHVtZSB0byBzZXQgYmV0d2VlbiAwIC0gMS5cbiAgICAgKiBAcmV0dXJuIHtGbG9hdH0gY3VycmVudCBhdWRpbyB2b2x1bWVcbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uICh2KSB7XG4gICAgICBpZiAodiAhPT0gdW5kZWZpbmVkICYmICFpc05hTihwYXJzZUludCh2LCAxMCkpKSB7XG4gICAgICAgIHRoaXMuYXVkaW8uc2V0Vm9sdW1lKHYpO1xuICAgICAgICB0aGlzLnZvbCA9IHY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy52b2w7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZWVrIGF1ZGlvIHRvIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtGbG9hdH0gcG9zaXRpb24gYXVkaW8gcG9zaXRpb24gaW4gc2Vjb25kcyB0byBzZWVrIHRvLlxuICAgICAqL1xuICAgIHNlZWs6IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5hdWRpby5zZWVrVG8ocG9zaXRpb24pO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVzdHJveSBhdWRpbyBvYmplY3QgYW5kIHJlbW92ZSBmcm9tIERPTVxuICAgICAqL1xuICAgIGRlc3Ryb3lBdWRpbzogZnVuY3Rpb24oKSB7XG4gICAgICBpZih0aGlzLmF1ZGlvKXtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICB0aGlzLmF1ZGlvLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5hdWRpbyk7XG4gICAgICAgIGRlbGV0ZSBnbG9iYWxBdWRpbzVGbGFzaC5pbnN0YW5jZXNbdGhpcy5pZF07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmF1ZGlvO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBpbmNsdWRlKEZsYXNoQXVkaW9QbGF5ZXIsIFB1YnN1Yik7XG4gIGluY2x1ZGUoRmxhc2hBdWRpb1BsYXllciwgQXVkaW9BdHRyaWJ1dGVzKTtcblxuICAvKipcbiAgICogSFRNTDUgQXVkaW8gUGxheWVyXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgSFRNTDVBdWRpb1BsYXllciA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gIEhUTUw1QXVkaW9QbGF5ZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHBsYXllciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudHJpZ2dlcigncmVhZHknKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBuZXcgYXVkaW8gaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjcmVhdGVBdWRpbzogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuYXVkaW8gPSBuZXcgQXVkaW8oKTtcbiAgICAgIHRoaXMuYXVkaW8uYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgIHRoaXMuYXVkaW8ucHJlbG9hZCA9ICdhdXRvJztcbiAgICAgIHRoaXMuYXVkaW8uYXV0b2J1ZmZlciA9IHRydWU7XG4gICAgICB0aGlzLmJpbmRFdmVudHMoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgY3VycmVudCBhdWRpbyBpbnN0YW5jZVxuICAgICAqL1xuICAgIGRlc3Ryb3lBdWRpbzogZnVuY3Rpb24oKXtcbiAgICAgIGlmKHRoaXMuYXVkaW8pe1xuICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5hdWRpby5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5hdWRpbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBhdWRpbyBldmVudCBsaXN0ZW5lcnMgb25jZSBzbyBhZGRpbmcgLyByZW1vdmluZyBldmVudCBsaXN0ZW5lcnMgaXMgYWx3YXlzIGRvbmVcbiAgICAgKiBvbiB0aGUgc2FtZSBjYWxsYmFja3MuXG4gICAgICovXG4gICAgc2V0dXBFdmVudExpc3RlbmVyczogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0ge1xuICAgICAgICBsb2Fkc3RhcnQ6IHRoaXMub25Mb2FkU3RhcnQuYmluZCh0aGlzKSxcbiAgICAgICAgY2FucGxheTogdGhpcy5vbkxvYWQuYmluZCh0aGlzKSxcbiAgICAgICAgbG9hZGVkbWV0YWRhdGE6IHRoaXMub25Mb2FkZWRNZXRhZGF0YS5iaW5kKHRoaXMpLFxuICAgICAgICBwbGF5OiB0aGlzLm9uUGxheS5iaW5kKHRoaXMpLFxuICAgICAgICBwYXVzZTogdGhpcy5vblBhdXNlLmJpbmQodGhpcyksXG4gICAgICAgIGVuZGVkOiB0aGlzLm9uRW5kZWQuYmluZCh0aGlzKSxcbiAgICAgICAgZXJyb3I6IHRoaXMub25FcnJvci5iaW5kKHRoaXMpLFxuICAgICAgICB0aW1ldXBkYXRlOiB0aGlzLm9uVGltZVVwZGF0ZS5iaW5kKHRoaXMpLFxuICAgICAgICBzZWVraW5nOiB0aGlzLm9uU2Vla2luZy5iaW5kKHRoaXMpLFxuICAgICAgICBzZWVrZWQ6IHRoaXMub25TZWVrZWQuYmluZCh0aGlzKVxuICAgICAgfTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEJpbmQgRE9NIGV2ZW50cyB0byBBdWRpbyBvYmplY3RcbiAgICAgKi9cbiAgICBiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRoaXMubGlzdGVuZXJzID09PSB1bmRlZmluZWQpe1xuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgdGhpcy5saXN0ZW5lcnMubG9hZHN0YXJ0LCBmYWxzZSk7XG4gICAgICB0aGlzLmF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCB0aGlzLmxpc3RlbmVycy5jYW5wbGF5LCBmYWxzZSk7XG4gICAgICB0aGlzLmF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlZG1ldGFkYXRhJywgdGhpcy5saXN0ZW5lcnMubG9hZGVkbWV0YWRhdGEsIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIHRoaXMubGlzdGVuZXJzLnBsYXksIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcigncGF1c2UnLCB0aGlzLmxpc3RlbmVycy5wYXVzZSwgZmFsc2UpO1xuICAgICAgdGhpcy5hdWRpby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIHRoaXMubGlzdGVuZXJzLmVuZGVkLCBmYWxzZSk7XG4gICAgICB0aGlzLmF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5saXN0ZW5lcnMuZXJyb3IsIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcigndGltZXVwZGF0ZScsIHRoaXMubGlzdGVuZXJzLnRpbWV1cGRhdGUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignc2Vla2luZycsIHRoaXMubGlzdGVuZXJzLnNlZWtpbmcsIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignc2Vla2VkJywgdGhpcy5saXN0ZW5lcnMuc2Vla2VkLCBmYWxzZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVbmJpbmQgRE9NIGV2ZW50cyBmcm9tIEF1ZGlvIG9iamVjdFxuICAgICAqL1xuICAgIHVuYmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIHRoaXMubGlzdGVuZXJzLmxvYWRzdGFydCk7XG4gICAgICB0aGlzLmF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCB0aGlzLmxpc3RlbmVycy5jYW5wbGF5KTtcbiAgICAgIHRoaXMuYXVkaW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZGVkbWV0YWRhdGEnLCB0aGlzLmxpc3RlbmVycy5sb2FkZWRtZXRhZGF0YSk7XG4gICAgICB0aGlzLmF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BsYXknLCB0aGlzLmxpc3RlbmVycy5wbGF5KTtcbiAgICAgIHRoaXMuYXVkaW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGF1c2UnLCB0aGlzLmxpc3RlbmVycy5wYXVzZSk7XG4gICAgICB0aGlzLmF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgdGhpcy5saXN0ZW5lcnMuZW5kZWQpO1xuICAgICAgdGhpcy5hdWRpby5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMubGlzdGVuZXJzLmVycm9yKTtcbiAgICAgIHRoaXMuYXVkaW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGltZXVwZGF0ZScsIHRoaXMubGlzdGVuZXJzLnRpbWV1cGRhdGUpO1xuICAgICAgdGhpcy5hdWRpby5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWVraW5nJywgdGhpcy5saXN0ZW5lcnMuc2Vla2luZyk7XG4gICAgICB0aGlzLmF1ZGlvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlZWtlZCcsIHRoaXMubGlzdGVuZXJzLnNlZWtlZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBsb2FkIHN0YXJ0IGV2ZW50IGhhbmRsZXIuIFRyaWdnZXJlZCB3aGVuIGF1ZGlvIHN0YXJ0cyBsb2FkaW5nXG4gICAgICovXG4gICAgb25Mb2FkU3RhcnQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2xvYWRzdGFydCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gY2FucGxheSBldmVudCBoYW5kbGVyLiBUcmlnZ2VyZWQgd2hlbiBhdWRpbyBpcyBsb2FkZWQgYW5kIGNhbiBiZSBwbGF5ZWQuXG4gICAgICogUmVzZXRzIHBsYXllciBwYXJhbWV0ZXJzIGFuZCBzdGFydHMgYXVkaW8gZG93bmxvYWQgcHJvZ3Jlc3MgdGltZXIuXG4gICAgICovXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZighdGhpcy5hdWRpbyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMub25Mb2FkLmJpbmQodGhpcyksIDEwMCk7XG4gICAgICB9XG4gICAgICB0aGlzLnNlZWthYmxlID0gdGhpcy5hdWRpby5zZWVrYWJsZSAmJiB0aGlzLmF1ZGlvLnNlZWthYmxlLmxlbmd0aCA+IDA7XG4gICAgICBpZiAodGhpcy5zZWVrYWJsZSkge1xuICAgICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwodGhpcy5vblByb2dyZXNzLmJpbmQodGhpcyksIDI1MCk7XG4gICAgICB9XG4gICAgICB0aGlzLnRyaWdnZXIoJ2NhbnBsYXknKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEF1ZGlvIElEMyBsb2FkIGV2ZW50IGhhbmRsZXIuIFRyaWdnZXJlZCB3aGVuIElEMyBtZXRhZGF0YSBpcyBsb2FkZWQuXG4gICAgICovXG4gICAgb25Mb2FkZWRNZXRhZGF0YTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMudHJpZ2dlcignbG9hZGVkbWV0YWRhdGEnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEF1ZGlvIHBsYXkgZXZlbnQgaGFuZGxlci4gVHJpZ2dlcmVkIHdoZW4gYXVkaW8gc3RhcnRzIHBsYXlpbmcuXG4gICAgICovXG4gICAgb25QbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgdGhpcy50cmlnZ2VyKCdwbGF5Jyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBwYXVzZSBldmVudCBoYW5kbGVyLiBUcmlnZ2VyZWQgd2hlbiBhdWRpbyBpcyBwYXVzZWQuXG4gICAgICovXG4gICAgb25QYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3BhdXNlJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBlbmRlZCBldmVudCBoYW5kbGVyLiBUcmlnZ2VyZWQgd2hlbiBhdWRpbyBwbGF5YmFjayBoYXMgZW5kZWQuXG4gICAgICovXG4gICAgb25FbmRlZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2VuZGVkJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyB0aW1ldXBkYXRlIGV2ZW50IGhhbmRsZXIuIFRyaWdnZXJlZCBhcyBsb25nIGFzIHBsYXloZWFkIHBvc2l0aW9uIGlzIHVwZGF0ZWQgKGF1ZGlvIGlzIGJlaW5nIHBsYXllZCkuXG4gICAgICovXG4gICAgb25UaW1lVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5hdWRpbyAmJiB0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lO1xuICAgICAgICAgIHRoaXMuZHVyYXRpb24gPSB0aGlzLmF1ZGlvLmR1cmF0aW9uID09PSBJbmZpbml0eSA/IG51bGwgOiB0aGlzLmF1ZGlvLmR1cmF0aW9uO1xuICAgICAgICB9IGNhdGNoIChlKXt9XG4gICAgICAgIHRoaXMudHJpZ2dlcigndGltZXVwZGF0ZScsIHRoaXMucG9zaXRpb24sIHRoaXMuZHVyYXRpb24pO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gZG93bmxvYWQgcHJvZ3Jlc3MgdGltZXIgY2FsbGJhY2suIENoZWNrIGF1ZGlvJ3MgZG93bmxvYWQgcGVyY2VudGFnZS5cbiAgICAgKiBDYWxsZWQgcGVyaW9kaWNhbGx5IGFzIHNvb24gYXMgdGhlIGF1ZGlvIGxvYWRzIGFuZCBjYW4gYmUgcGxheWVkLlxuICAgICAqIENhbmNlbGxlZCB3aGVuIGF1ZGlvIGhhcyBmdWxseSBkb3dubG9hZCBvciB3aGVuIGEgbmV3IGF1ZGlvIGZpbGUgaGFzIGJlZW4gbG9hZGVkIHRvIHRoZSBwbGF5ZXIuXG4gICAgICovXG4gICAgb25Qcm9ncmVzczogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuYXVkaW8gJiYgdGhpcy5hdWRpby5idWZmZXJlZCAhPT0gbnVsbCAmJiB0aGlzLmF1ZGlvLmJ1ZmZlcmVkLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gdGhpcy5hdWRpby5kdXJhdGlvbiA9PT0gSW5maW5pdHkgPyBudWxsIDogdGhpcy5hdWRpby5kdXJhdGlvbjtcbiAgICAgICAgdGhpcy5sb2FkX3BlcmNlbnQgPSBwYXJzZUludCgoKHRoaXMuYXVkaW8uYnVmZmVyZWQuZW5kKHRoaXMuYXVkaW8uYnVmZmVyZWQubGVuZ3RoIC0gMSkgLyB0aGlzLmR1cmF0aW9uKSAqIDEwMCksIDEwKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdwcm9ncmVzcycsIHRoaXMubG9hZF9wZXJjZW50KTtcbiAgICAgICAgaWYgKHRoaXMubG9hZF9wZXJjZW50ID49IDEwMCkge1xuICAgICAgICAgIHRoaXMuY2xlYXJMb2FkUHJvZ3Jlc3MoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gZXJyb3IgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSBlIGVycm9yIGV2ZW50XG4gICAgICovXG4gICAgb25FcnJvcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCBlKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEF1ZGlvIHNlZWtpbmcgZXZlbnQgaGFuZGxlci4gVHJpZ2dlcmVkIHdoZW4gYXVkaW8gc2VlayBzdGFydHMuXG4gICAgICovXG4gICAgb25TZWVraW5nOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50cmlnZ2VyKCdzZWVraW5nJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBzZWVrZWQgZXZlbnQgaGFuZGxlci4gVHJpZ2dlcmVkIHdoZW4gYXVkaW8gaGFzIGJlZW4gc2Vla2VkLlxuICAgICAqL1xuICAgIG9uU2Vla2VkOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50cmlnZ2VyKCdzZWVrZWQnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFycyBwZXJpb2RpY2FsIGF1ZGlvIGRvd25sb2FkIHByb2dyZXNzIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIGNsZWFyTG9hZFByb2dyZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy50aW1lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVyO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUmVzZXRzIGF1ZGlvIHBvc2l0aW9uIGFuZCBwYXJhbWV0ZXJzLlxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsZWFyTG9hZFByb2dyZXNzKCk7XG4gICAgICB0aGlzLnNlZWthYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmR1cmF0aW9uID0gMDtcbiAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgICAgdGhpcy5sb2FkX3BlcmNlbnQgPSAwO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTG9hZCBhdWRpbyBmcm9tIHVybC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFVSTCBvZiBhdWRpbyB0byBsb2FkXG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24gKHVybCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgLy90aGlzLmRlc3Ryb3lBdWRpbygpO1xuICAgICAgaWYodGhpcy5hdWRpbyA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGhpcy5jcmVhdGVBdWRpbygpO1xuICAgICAgfVxuICAgICAgdGhpcy5hdWRpby5zZXRBdHRyaWJ1dGUoJ3NyYycsIHVybCk7XG4gICAgICB0aGlzLmF1ZGlvLmxvYWQoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFBsYXkgYXVkaW9cbiAgICAgKi9cbiAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFBhdXNlIGF1ZGlvXG4gICAgICovXG4gICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCAvIFNldCBhdWRpbyB2b2x1bWVcbiAgICAgKiBAcGFyYW0ge0Zsb2F0fSB2IGF1ZGlvIHZvbHVtZSB0byBzZXQgYmV0d2VlbiAwIC0gMS5cbiAgICAgKiBAcmV0dXJuIHtGbG9hdH0gY3VycmVudCBhdWRpbyB2b2x1bWVcbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uICh2KSB7XG4gICAgICBpZiAodiAhPT0gdW5kZWZpbmVkICYmICFpc05hTihwYXJzZUludCh2LCAxMCkpKSB7XG4gICAgICAgIHZhciB2b2wgPSB2IDwgMCA/IDAgOiBNYXRoLm1pbigxLCB2KTtcbiAgICAgICAgdGhpcy5hdWRpby52b2x1bWUgPSB2b2w7XG4gICAgICAgIHRoaXMudm9sID0gdm9sO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2VlayBhdWRpbyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7RmxvYXR9IHBvc2l0aW9uIGF1ZGlvIHBvc2l0aW9uIGluIHNlY29uZHMgdG8gc2VlayB0by5cbiAgICAgKi9cbiAgICBzZWVrOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgIHZhciBwbGF5aW5nID0gdGhpcy5wbGF5aW5nO1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5hdWRpby5jdXJyZW50VGltZSA9IHBvc2l0aW9uO1xuICAgICAgaWYgKHBsYXlpbmcpIHtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5hdWRpby5idWZmZXJlZCAhPT0gbnVsbCAmJiB0aGlzLmF1ZGlvLmJ1ZmZlcmVkLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMudHJpZ2dlcigndGltZXVwZGF0ZScsIHRoaXMucG9zaXRpb24sIHRoaXMuZHVyYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGluY2x1ZGUoSFRNTDVBdWRpb1BsYXllciwgUHVic3ViKTtcbiAgaW5jbHVkZShIVE1MNUF1ZGlvUGxheWVyLCBBdWRpb0F0dHJpYnV0ZXMpO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IHNldHRpbmdzIG9iamVjdFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdmFyIHNldHRpbmdzID0ge1xuICAgIC8qKlxuICAgICAqIHtTdHJpbmd9IHBhdGggdG8gRmxhc2ggYXVkaW8gcGxheWVyIFNXRiBmaWxlXG4gICAgICovXG4gICAgc3dmX3BhdGg6ICcvc3dmL2F1ZGlvanMuc3dmJyxcbiAgICAvKipcbiAgICAgKiB7Qm9vbGVhbn0gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdGhyb3cgZXJyb3JzIHRvIHRoZSBwYWdlIG9yIHRyaWdnZXIgYW4gZXJyb3IgZXZlbnRcbiAgICAgKi9cbiAgICB0aHJvd19lcnJvcnM6IHRydWUsXG4gICAgLyoqXG4gICAgICoge0Jvb2xlYW59IGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGZvcm1hdCBwbGF5ZXIgZHVyYXRpb24gYW5kIHBvc2l0aW9uIHRvIGhoOm1tOnNzIG9yIHBhc3MgYXMgcmF3IHNlY29uZHNcbiAgICAgKi9cbiAgICBmb3JtYXRfdGltZTogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiB7QXJyYXl9IGxpc3Qgb2YgY29kZWNzIHRvIHRyeSBhbmQgdXNlIHdoZW4gaW5pdGlhbGl6aW5nIHRoZSBwbGF5ZXIuIFVzZWQgdG8gc2VsZWN0aXZlbHkgaW5pdGlhbGl6ZSB0aGUgaW50ZXJuYWwgYXVkaW8gcGxheWVyIGJhc2VkIG9uIGNvZGVjIHN1cHBvcnRcbiAgICAgKi9cbiAgICBjb2RlY3M6IFsnbXAzJ11cbiAgfTtcblxuICAvKipcbiAgICogQXVkaW81anMgQXVkaW8gUGxheWVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzIHBsYXllciBzZXR0aW5ncyBvYmplY3RcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBBdWRpbzVqcyA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcyA9IHMgfHwge307XG4gICAgdmFyIGs7XG4gICAgZm9yIChrIGluIHNldHRpbmdzKSB7XG4gICAgICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoaykgJiYgIXMuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgc1trXSA9IHNldHRpbmdzW2tdO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmluaXQocyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgY2FuIHBsYXkgYSBnaXZlbiBhdWRpbyBtaW1lIHR5cGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lX3R5cGUgYXVkaW8gbWltZSB0eXBlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBpcyBhdWRpbyBtaW1lIHR5cGUgc3VwcG9ydGVkIGJ5IGJyb3dzZXIgb3Igbm90XG4gICAqL1xuICBBdWRpbzVqcy5jYW5fcGxheSA9IGZ1bmN0aW9uIChtaW1lX3R5cGUpIHtcbiAgICByZXR1cm4gdXRpbC5jYW5fcGxheShtaW1lX3R5cGUpO1xuICB9O1xuXG4gIEF1ZGlvNWpzLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBsYXllciBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcyBwbGF5ZXIgc2V0dGluZ3Mgb2JqZWN0XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24gKHMpIHtcbiAgICAgIHRoaXMucmVhZHkgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSBzO1xuICAgICAgdGhpcy5hdWRpbyA9IHRoaXMuZ2V0UGxheWVyKCk7XG4gICAgICB0aGlzLmJpbmRBdWRpb0V2ZW50cygpO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudXNlX2ZsYXNoKSB7XG4gICAgICAgIHRoaXMuYXVkaW8uaW5pdChzLnN3Zl9wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXVkaW8uaW5pdCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0cyBhIG5ldyBhdWRpbyBwbGF5ZXIgaW5zdGFuY2UgYmFzZWQgb24gY29kZWMgc3VwcG9ydCBhcyBkZWZpbmVkIGluIHNldHRpbmdzLmNvZGVjcyBhcnJheS5cbiAgICAgKiBEZWZhdWx0cyB0byBNUDMgcGxheWVyIGVpdGhlciBIVE1MIG9yIEZsYXNoIGJhc2VkLlxuICAgICAqIEByZXR1cm4ge0ZsYXNoQXVkaW9QbGF5ZXIsSFRNTDVBdWRpb1BsYXllcn0gYXVkaW8gcGxheWVyIGluc3RhbmNlXG4gICAgICovXG4gICAgZ2V0UGxheWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaSwgbCwgcGxheWVyLCBjb2RlYztcbiAgICAgIGlmKHRoaXMuc2V0dGluZ3MudXNlX2ZsYXNoKXtcbiAgICAgICAgcGxheWVyID0gbmV3IEZsYXNoQXVkaW9QbGF5ZXIoKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wbGF5ZXIgPSB7XG4gICAgICAgICAgZW5naW5lOiAnZmxhc2gnLFxuICAgICAgICAgIGNvZGVjOiAnbXAzJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHRoaXMuc2V0dGluZ3MuY29kZWNzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGNvZGVjID0gdGhpcy5zZXR0aW5ncy5jb2RlY3NbaV07XG4gICAgICAgICAgaWYgKEF1ZGlvNWpzLmNhbl9wbGF5KGNvZGVjKSkge1xuICAgICAgICAgICAgcGxheWVyID0gbmV3IEhUTUw1QXVkaW9QbGF5ZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MudXNlX2ZsYXNoID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBsYXllciA9IHtcbiAgICAgICAgICAgICAgZW5naW5lOiAnaHRtbCcsXG4gICAgICAgICAgICAgIGNvZGVjOiBjb2RlY1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBoZXJlIHdlIGRvdWJsZSBjaGVjayBmb3IgbXAzIHN1cHBvcnQgaW5zdGVhZCBvZiBkZWZhdWx0aW5nIHRvIEZsYXNoIGluIGNhc2UgdXNlciBvdmVycm9kZSB0aGUgc2V0dGluZ3MuY29kZWNzIGFycmF5IHdpdGggYW4gZW1wdHkgYXJyYXkuXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy51c2VfZmxhc2ggPSAhQXVkaW81anMuY2FuX3BsYXkoJ21wMycpO1xuICAgICAgICAgIHBsYXllciA9IHRoaXMuc2V0dGluZ3MudXNlX2ZsYXNoID8gbmV3IEZsYXNoQXVkaW9QbGF5ZXIoKSA6IG5ldyBIVE1MNUF1ZGlvUGxheWVyKCk7XG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5wbGF5ZXIgPSB7XG4gICAgICAgICAgICBlbmdpbmU6ICh0aGlzLnNldHRpbmdzLnVzZV9mbGFzaCA/ICdmbGFzaCcgOiAnaHRtbCcpLFxuICAgICAgICAgICAgY29kZWM6ICdtcDMnXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBsYXllcjtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzIGZyb20gYXVkaW8gb2JqZWN0IHRvIGludGVybmFsIGNhbGxiYWNrc1xuICAgICAqL1xuICAgIGJpbmRBdWRpb0V2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hdWRpby5vbigncmVhZHknLCB0aGlzLm9uUmVhZHksIHRoaXMpO1xuICAgICAgdGhpcy5hdWRpby5vbignbG9hZHN0YXJ0JywgdGhpcy5vbkxvYWRTdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9uKCdsb2FkZWRtZXRhZGF0YScsIHRoaXMub25Mb2FkZWRNZXRhZGF0YSwgdGhpcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9uKCdwbGF5JywgdGhpcy5vblBsYXksIHRoaXMpO1xuICAgICAgdGhpcy5hdWRpby5vbigncGF1c2UnLCB0aGlzLm9uUGF1c2UsIHRoaXMpO1xuICAgICAgdGhpcy5hdWRpby5vbignZW5kZWQnLCB0aGlzLm9uRW5kZWQsIHRoaXMpO1xuICAgICAgdGhpcy5hdWRpby5vbignY2FucGxheScsIHRoaXMub25DYW5QbGF5LCB0aGlzKTtcbiAgICAgIHRoaXMuYXVkaW8ub24oJ3RpbWV1cGRhdGUnLCB0aGlzLm9uVGltZVVwZGF0ZSwgdGhpcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9uKCdwcm9ncmVzcycsIHRoaXMub25Qcm9ncmVzcywgdGhpcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9uKCdlcnJvcicsIHRoaXMub25FcnJvciwgdGhpcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9uKCdzZWVraW5nJywgdGhpcy5vblNlZWtpbmcsIHRoaXMpO1xuICAgICAgdGhpcy5hdWRpby5vbignc2Vla2VkJywgdGhpcy5vblNlZWtlZCwgdGhpcyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50cyBmcm9tIGF1ZGlvIG9iamVjdCB0byBpbnRlcm5hbCBjYWxsYmFja3NcbiAgICAgKi9cbiAgICB1bmJpbmRBdWRpb0V2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hdWRpby5vZmYoJ3JlYWR5JywgdGhpcy5vblJlYWR5KTtcbiAgICAgIHRoaXMuYXVkaW8ub2ZmKCdsb2Fkc3RhcnQnLCB0aGlzLm9uTG9hZFN0YXJ0KTtcbiAgICAgIHRoaXMuYXVkaW8ub2ZmKCdsb2FkZWRtZXRhZGF0YScsIHRoaXMub25Mb2FkZWRNZXRhZGF0YSk7XG4gICAgICB0aGlzLmF1ZGlvLm9mZigncGxheScsIHRoaXMub25QbGF5KTtcbiAgICAgIHRoaXMuYXVkaW8ub2ZmKCdwYXVzZScsIHRoaXMub25QYXVzZSk7XG4gICAgICB0aGlzLmF1ZGlvLm9mZignZW5kZWQnLCB0aGlzLm9uRW5kZWQpO1xuICAgICAgdGhpcy5hdWRpby5vZmYoJ2NhbnBsYXknLCB0aGlzLm9uQ2FuUGxheSk7XG4gICAgICB0aGlzLmF1ZGlvLm9mZigndGltZXVwZGF0ZScsIHRoaXMub25UaW1lVXBkYXRlKTtcbiAgICAgIHRoaXMuYXVkaW8ub2ZmKCdwcm9ncmVzcycsIHRoaXMub25Qcm9ncmVzcyk7XG4gICAgICB0aGlzLmF1ZGlvLm9mZignZXJyb3InLCB0aGlzLm9uRXJyb3IpO1xuICAgICAgdGhpcy5hdWRpby5vZmYoJ3NlZWtpbmcnLCB0aGlzLm9uU2Vla2luZyk7XG4gICAgICB0aGlzLmF1ZGlvLm9mZignc2Vla2VkJywgdGhpcy5vblNlZWtlZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBMb2FkIGF1ZGlvIGZyb20gVVJMXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBVUkwgb2YgYXVkaW8gdG8gbG9hZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICBmID0gZnVuY3Rpb24odSl7XG4gICAgICAgICAgICB0aGF0LmF1ZGlvLmxvYWQodSk7XG4gICAgICAgICAgICB0aGF0LnRyaWdnZXIoJ2xvYWQnKTtcbiAgICAgICAgICB9O1xuXG4gICAgICBpZih0aGlzLnJlYWR5KXtcbiAgICAgICAgZih1cmwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5vbigncmVhZHknLCBmKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFBsYXkgYXVkaW9cbiAgICAgKi9cbiAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZighdGhpcy5wbGF5aW5nKXtcbiAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQYXVzZSBhdWRpb1xuICAgICAqL1xuICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZih0aGlzLnBsYXlpbmcpe1xuICAgICAgICB0aGlzLmF1ZGlvLnBhdXNlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUb2dnbGUgYXVkaW8gcGxheSAvIHBhdXNlXG4gICAgICovXG4gICAgcGxheVBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzW3RoaXMucGxheWluZyA/ICdwYXVzZScgOiAncGxheSddKCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgLyBTZXQgYXVkaW8gdm9sdW1lXG4gICAgICogQHBhcmFtIHtGbG9hdH0gdiBhdWRpbyB2b2x1bWUgdG8gc2V0IGJldHdlZW4gMCAtIDEuXG4gICAgICogQHJldHVybiB7RmxvYXR9IGN1cnJlbnQgYXVkaW8gdm9sdW1lXG4gICAgICovXG4gICAgdm9sdW1lOiBmdW5jdGlvbiAodikge1xuICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiAhaXNOYU4ocGFyc2VJbnQodiwgMTApKSkge1xuICAgICAgICB0aGlzLmF1ZGlvLnZvbHVtZSh2KTtcbiAgICAgICAgdGhpcy52b2wgPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sO1xuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2VlayBhdWRpbyB0byBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7RmxvYXR9IHBvc2l0aW9uIGF1ZGlvIHBvc2l0aW9uIGluIHNlY29uZHMgdG8gc2VlayB0by5cbiAgICAgKi9cbiAgICBzZWVrOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgIHRoaXMuYXVkaW8uc2Vlayhwb3NpdGlvbik7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGF1ZGlvIG9iamVjdCBhbmQgcmVtb3ZlIGZyb20gRE9NXG4gICAgICovXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnVuYmluZEF1ZGlvRXZlbnRzKCk7XG4gICAgICB0aGlzLmF1ZGlvLmRlc3Ryb3lBdWRpbygpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZm9yIGF1ZGlvIHJlYWR5IGV2ZW50LiBJbmRpY2F0ZXMgYXVkaW8gaXMgcmVhZHkgZm9yIHBsYXliYWNrLlxuICAgICAqIExvb2tzIGZvciByZWFkeSBjYWxsYmFjayBpbiBzZXR0aW5ncyBvYmplY3QgYW5kIGludm9rZXMgaXQgaW4gdGhlIGNvbnRleHQgb2YgcGxheWVyIGluc3RhbmNlXG4gICAgICovXG4gICAgb25SZWFkeTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICBpZiAodHlwZW9mICh0aGlzLnNldHRpbmdzLnJlYWR5KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnJlYWR5LmNhbGwodGhpcywgdGhpcy5zZXR0aW5ncy5wbGF5ZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy50cmlnZ2VyKCdyZWFkeScpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gbG9hZCBzdGFydCBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgb25Mb2FkU3RhcnQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2xvYWRzdGFydCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gbWV0YWRhdGEgbG9hZGVkIGV2ZW50IGhhbmRsZXJcbiAgICAgKi9cbiAgICBvbkxvYWRlZE1ldGFkYXRhOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50cmlnZ2VyKCdsb2FkZWRtZXRhZGF0YScpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gcGxheSBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgb25QbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgdGhpcy50cmlnZ2VyKCdwbGF5Jyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBwYXVzZSBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgb25QYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3BhdXNlJyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBQbGF5YmFjayBlbmQgZXZlbnQgaGFuZGxlclxuICAgICAqL1xuICAgIG9uRW5kZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgdGhpcy50cmlnZ2VyKCdlbmRlZCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gZXJyb3IgZXZlbnQgaGFuZGxlclxuICAgICAqL1xuICAgIG9uRXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlcnJvciA9IG5ldyBBdWRpb0Vycm9yKCdBdWRpbyBFcnJvci4gRmFpbGVkIHRvIExvYWQgQXVkaW8nKTtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnRocm93X2Vycm9ycykge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCBlcnJvcik7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBjYW5wbGF5IGV2ZW50IGhhbmRsZXIuIFRyaWdnZXJlZCB3aGVuIGVub3VnaCBhdWRpbyBoYXMgYmVlbiBsb2FkZWQgdG8gYnkgcGxheWVkLlxuICAgICAqL1xuICAgIG9uQ2FuUGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy50cmlnZ2VyKCdjYW5wbGF5Jyk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBdWRpbyBzZWVraW5nIGV2ZW50IGhhbmRsZXJcbiAgICAgKi9cbiAgICBvblNlZWtpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3NlZWtpbmcnKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEF1ZGlvIHNlZWtlZCBldmVudCBoYW5kbGVyXG4gICAgICovXG4gICAgb25TZWVrZWQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnRyaWdnZXIoJ3NlZWtlZCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUGxheWJhY2sgdGltZSB1cGRhdGUgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RmxvYXR9IHBvc2l0aW9uIHBsYXkgaGVhZCBwb3NpdGlvbiAoc2VjKVxuICAgICAqIEBwYXJhbSB7RmxvYXR9IGR1cmF0aW9uIGF1ZGlvIGR1cmF0aW9uIChzZWMpXG4gICAgICovXG4gICAgb25UaW1lVXBkYXRlOiBmdW5jdGlvbiAocG9zaXRpb24sIGR1cmF0aW9uKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5zZXR0aW5ncy5mb3JtYXRfdGltZSA/IHV0aWwuZm9ybWF0VGltZShwb3NpdGlvbikgOiBwb3NpdGlvbjtcbiAgICAgIGlmICh0aGlzLmR1cmF0aW9uICE9PSBkdXJhdGlvbikge1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gdGhpcy5zZXR0aW5ncy5mb3JtYXRfdGltZSAmJiBkdXJhdGlvbiAhPT0gbnVsbCA/IHV0aWwuZm9ybWF0VGltZShkdXJhdGlvbikgOiBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICAgIHRoaXMudHJpZ2dlcigndGltZXVwZGF0ZScsIHRoaXMucG9zaXRpb24sIHRoaXMuZHVyYXRpb24pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXVkaW8gZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RmxvYXR9IGxvYWRlZCBhdWRpbyBkb3dubG9hZCBwZXJjZW50XG4gICAgICovXG4gICAgb25Qcm9ncmVzczogZnVuY3Rpb24gKGxvYWRlZCkge1xuICAgICAgdGhpcy5kdXJhdGlvbiA9IHRoaXMuYXVkaW8uZHVyYXRpb247XG4gICAgICB0aGlzLmxvYWRfcGVyY2VudCA9IGxvYWRlZDtcbiAgICAgIHRoaXMudHJpZ2dlcigncHJvZ3Jlc3MnLCBsb2FkZWQpO1xuICAgIH1cbiAgfTtcblxuICBpbmNsdWRlKEF1ZGlvNWpzLCBQdWJzdWIpO1xuICBpbmNsdWRlKEF1ZGlvNWpzLCBBdWRpb0F0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiBBdWRpbzVqcztcblxufSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290LmNhc2ggPSByb290LiQgPSBmYWN0b3J5KCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LCB3aW4gPSB3aW5kb3csIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIHNsaWNlID0gQXJyYXlQcm90by5zbGljZSwgZmlsdGVyID0gQXJyYXlQcm90by5maWx0ZXIsIHB1c2ggPSBBcnJheVByb3RvLnB1c2g7XG5cbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fSwgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSB0eXBlb2Ygbm9vcDtcbiAgfSwgaXNTdHJpbmcgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gdHlwZW9mIFwiXCI7XG4gIH07XG5cbiAgdmFyIGlkTWF0Y2ggPSAvXiNbXFx3LV0qJC8sIGNsYXNzTWF0Y2ggPSAvXlxcLltcXHctXSokLywgaHRtbE1hdGNoID0gLzwuKz4vLCBzaW5nbGV0ID0gL15cXHcrJC87XG5cbiAgZnVuY3Rpb24gZmluZChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IGRvYztcbiAgICB2YXIgZWxlbXMgPSAoY2xhc3NNYXRjaC50ZXN0KHNlbGVjdG9yKSA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3Rvci5zbGljZSgxKSkgOiBzaW5nbGV0LnRlc3Qoc2VsZWN0b3IpID8gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3RvcikgOiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICByZXR1cm4gZWxlbXM7XG4gIH1cblxuICB2YXIgZnJhZywgdG1wO1xuICBmdW5jdGlvbiBwYXJzZUhUTUwoc3RyKSB7XG4gICAgZnJhZyA9IGZyYWcgfHwgZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB0bXAgPSB0bXAgfHwgZnJhZy5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG4gICAgdG1wLmlubmVySFRNTCA9IHN0cjtcbiAgICByZXR1cm4gdG1wLmNoaWxkTm9kZXM7XG4gIH1cblxuICBmdW5jdGlvbiBvblJlYWR5KGZuKSB7XG4gICAgaWYgKGRvYy5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIikge1xuICAgICAgZm4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBJbml0KHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gSWYgYWxyZWFkeSBhIGNhc2ggY29sbGVjdGlvbiwgZG9uJ3QgZG8gYW55IGZ1cnRoZXIgcHJvY2Vzc2luZ1xuICAgIGlmIChzZWxlY3Rvci5jYXNoICYmIHNlbGVjdG9yICE9PSB3aW4pIHtcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9XG5cbiAgICB2YXIgZWxlbXMgPSBzZWxlY3RvciwgaSA9IDAsIGxlbmd0aDtcblxuICAgIGlmIChpc1N0cmluZyhzZWxlY3RvcikpIHtcbiAgICAgIGVsZW1zID0gKGlkTWF0Y2gudGVzdChzZWxlY3RvcikgP1xuICAgICAgLy8gSWYgYW4gSUQgdXNlIHRoZSBmYXN0ZXIgZ2V0RWxlbWVudEJ5SWQgY2hlY2tcbiAgICAgIGRvYy5nZXRFbGVtZW50QnlJZChzZWxlY3Rvci5zbGljZSgxKSkgOiBodG1sTWF0Y2gudGVzdChzZWxlY3RvcikgP1xuICAgICAgLy8gSWYgSFRNTCwgcGFyc2UgaXQgaW50byByZWFsIGVsZW1lbnRzXG4gICAgICBwYXJzZUhUTUwoc2VsZWN0b3IpIDpcbiAgICAgIC8vIGVsc2UgdXNlIGBmaW5kYFxuICAgICAgZmluZChzZWxlY3RvciwgY29udGV4dCkpO1xuXG4gICAgICAvLyBJZiBmdW5jdGlvbiwgdXNlIGFzIHNob3J0Y3V0IGZvciBET00gcmVhZHlcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24oc2VsZWN0b3IpKSB7XG4gICAgICBvblJlYWR5KHNlbGVjdG9yKTtyZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAoIWVsZW1zKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBJZiBhIHNpbmdsZSBET00gZWxlbWVudCBpcyBwYXNzZWQgaW4gb3IgcmVjZWl2ZWQgdmlhIElELCByZXR1cm4gdGhlIHNpbmdsZSBlbGVtZW50XG4gICAgaWYgKGVsZW1zLm5vZGVUeXBlIHx8IGVsZW1zID09PSB3aW4pIHtcbiAgICAgIHRoaXNbMF0gPSBlbGVtcztcbiAgICAgIHRoaXMubGVuZ3RoID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVHJlYXQgbGlrZSBhbiBhcnJheSBhbmQgbG9vcCB0aHJvdWdoIGVhY2ggaXRlbS5cbiAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoID0gZWxlbXMubGVuZ3RoO1xuICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzW2ldID0gZWxlbXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmdW5jdGlvbiBjYXNoKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBJbml0KHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgfVxuXG4gIHZhciBmbiA9IGNhc2guZm4gPSBjYXNoLnByb3RvdHlwZSA9IEluaXQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBjYXNoLFxuICAgIGNhc2g6IHRydWUsXG4gICAgbGVuZ3RoOiAwLFxuICAgIHB1c2g6IHB1c2gsXG4gICAgc3BsaWNlOiBBcnJheVByb3RvLnNwbGljZSxcbiAgICBtYXA6IEFycmF5UHJvdG8ubWFwLFxuICAgIGluaXQ6IEluaXRcbiAgfTtcblxuICBjYXNoLnBhcnNlSFRNTCA9IHBhcnNlSFRNTDtcbiAgY2FzaC5ub29wID0gbm9vcDtcbiAgY2FzaC5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbiAgY2FzaC5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG4gIGNhc2guZXh0ZW5kID0gZm4uZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcblxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpLCBsZW5ndGggPSBhcmdzLmxlbmd0aCwgaSA9IDE7XG5cbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRhcmdldCA9IHRoaXM7XG4gICAgICBpID0gMDtcbiAgICB9XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWFyZ3NbaV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXJnc1tpXSkge1xuICAgICAgICBpZiAoYXJnc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBhcmdzW2ldW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVhY2goY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcbiAgICB2YXIgbCA9IGNvbGxlY3Rpb24ubGVuZ3RoLCBpID0gMDtcblxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoY2FsbGJhY2suY2FsbChjb2xsZWN0aW9uW2ldLCBjb2xsZWN0aW9uW2ldLCBpLCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2hlcyhlbCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gKGVsLm1hdGNoZXMgfHwgZWwud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGVsLm1vek1hdGNoZXNTZWxlY3RvciB8fCBlbC5tc01hdGNoZXNTZWxlY3RvciB8fCBlbC5vTWF0Y2hlc1NlbGVjdG9yKS5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIH1cblxuICBmdW5jdGlvbiB1bmlxdWUoY29sbGVjdGlvbikge1xuICAgIHJldHVybiBjYXNoKHNsaWNlLmNhbGwoY29sbGVjdGlvbikuZmlsdGVyKGZ1bmN0aW9uIChpdGVtLCBpbmRleCwgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gaW5kZXg7XG4gICAgfSkpO1xuICB9XG5cbiAgY2FzaC5leHRlbmQoe1xuICAgIG1lcmdlOiBmdW5jdGlvbiAoZmlyc3QsIHNlY29uZCkge1xuICAgICAgdmFyIGxlbiA9ICtzZWNvbmQubGVuZ3RoLCBpID0gZmlyc3QubGVuZ3RoLCBqID0gMDtcblxuICAgICAgZm9yICg7IGogPCBsZW47IGkrKywgaisrKSB7XG4gICAgICAgIGZpcnN0W2ldID0gc2Vjb25kW2pdO1xuICAgICAgfVxuXG4gICAgICBmaXJzdC5sZW5ndGggPSBpO1xuICAgICAgcmV0dXJuIGZpcnN0O1xuICAgIH0sXG5cbiAgICBlYWNoOiBlYWNoLFxuICAgIG1hdGNoZXM6IG1hdGNoZXMsXG4gICAgdW5pcXVlOiB1bmlxdWUsXG4gICAgaXNBcnJheTogQXJyYXkuaXNBcnJheSxcbiAgICBpc051bWVyaWM6IGZ1bmN0aW9uIChuKSB7XG4gICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xuICAgIH1cblxuICB9KTtcblxuICB2YXIgdWlkID0gY2FzaC51aWQgPSBcIl9jYXNoXCIgKyBEYXRlLm5vdygpO1xuXG4gIGZ1bmN0aW9uIGdldERhdGFDYWNoZShub2RlKSB7XG4gICAgcmV0dXJuIChub2RlW3VpZF0gPSBub2RlW3VpZF0gfHwge30pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0RGF0YShub2RlLCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIChnZXREYXRhQ2FjaGUobm9kZSlba2V5XSA9IHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGEobm9kZSwga2V5KSB7XG4gICAgdmFyIGMgPSBnZXREYXRhQ2FjaGUobm9kZSk7XG4gICAgaWYgKGNba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjW2tleV0gPSBub2RlLmRhdGFzZXQgPyBub2RlLmRhdGFzZXRba2V5XSA6IGNhc2gobm9kZSkuYXR0cihcImRhdGEtXCIgKyBrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gY1trZXldO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlRGF0YShub2RlLCBrZXkpIHtcbiAgICB2YXIgYyA9IGdldERhdGFDYWNoZShub2RlKTtcbiAgICBpZiAoYykge1xuICAgICAgZGVsZXRlIGNba2V5XTtcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGF0YXNldCkge1xuICAgICAgZGVsZXRlIG5vZGUuZGF0YXNldFtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYXNoKG5vZGUpLnJlbW92ZUF0dHIoXCJkYXRhLVwiICsgbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZm4uZXh0ZW5kKHtcbiAgICBkYXRhOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgLy8gVE9ETzogdGVhciBvdXQgaW50byBtb2R1bGUgZm9yIElFOVxuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZ2V0RGF0YSh0aGlzWzBdLCBrZXkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gc2V0RGF0YSh2LCBrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW1vdmVEYXRhOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBUT0RPOiB0ZWFyIG91dCBpbnRvIG1vZHVsZSBmb3IgSUU5XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiByZW1vdmVEYXRhKHYsIGtleSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgdmFyIG5vdFdoaXRlTWF0Y2ggPSAvXFxTKy9nO1xuXG4gIGZ1bmN0aW9uIGhhc0NsYXNzKHYsIGMpIHtcbiAgICByZXR1cm4gKHYuY2xhc3NMaXN0ID8gdi5jbGFzc0xpc3QuY29udGFpbnMoYykgOiBuZXcgUmVnRXhwKFwiKF58IClcIiArIGMgKyBcIiggfCQpXCIsIFwiZ2lcIikudGVzdCh2LmNsYXNzTmFtZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ2xhc3ModiwgYywgc3BhY2VkTmFtZSkge1xuICAgIGlmICh2LmNsYXNzTGlzdCkge1xuICAgICAgdi5jbGFzc0xpc3QuYWRkKGMpO1xuICAgIH0gZWxzZSBpZiAoc3BhY2VkTmFtZS5pbmRleE9mKFwiIFwiICsgYyArIFwiIFwiKSkge1xuICAgICAgdi5jbGFzc05hbWUgKz0gXCIgXCIgKyBjO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKHYsIGMpIHtcbiAgICBpZiAodi5jbGFzc0xpc3QpIHtcbiAgICAgIHYuY2xhc3NMaXN0LnJlbW92ZShjKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdi5jbGFzc05hbWUgPSB2LmNsYXNzTmFtZS5yZXBsYWNlKGMsIFwiXCIpO1xuICAgIH1cbiAgfVxuXG4gIGZuLmV4dGVuZCh7XG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IGMubWF0Y2gobm90V2hpdGVNYXRjaCk7XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIHNwYWNlZE5hbWUgPSBcIiBcIiArIHYuY2xhc3NOYW1lICsgXCIgXCI7XG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICBhZGRDbGFzcyh2LCBjLCBzcGFjZWROYW1lKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXR0cjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiAodGhpc1swXS5nZXRBdHRyaWJ1dGUgPyB0aGlzWzBdLmdldEF0dHJpYnV0ZShuYW1lKSA6IHRoaXNbMF1bbmFtZV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICBpZiAodi5zZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICB2LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdltuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XG4gICAgICB2YXIgY2hlY2sgPSBmYWxzZTtcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICBjaGVjayA9IGhhc0NsYXNzKHYsIGMpO1xuICAgICAgICByZXR1cm4gIWNoZWNrO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY2hlY2s7XG4gICAgfSxcblxuICAgIHByb3A6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpc1swXVtuYW1lXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdltuYW1lXSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbW92ZUF0dHI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGlmICh2LnJlbW92ZUF0dHJpYnV0ZSkge1xuICAgICAgICAgIHYucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB2W25hbWVdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChjKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IGMubWF0Y2gobm90V2hpdGVNYXRjaCk7XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgZWFjaChjbGFzc2VzLCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgIHJlbW92ZUNsYXNzKHYsIGMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW1vdmVQcm9wOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICBkZWxldGUgdltuYW1lXTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24gKGMsIHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpc1tzdGF0ZSA/IFwiYWRkQ2xhc3NcIiA6IFwicmVtb3ZlQ2xhc3NcIl0oYyk7XG4gICAgICB9XG4gICAgICB2YXIgY2xhc3NlcyA9IGMubWF0Y2gobm90V2hpdGVNYXRjaCk7XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIHNwYWNlZE5hbWUgPSBcIiBcIiArIHYuY2xhc3NOYW1lICsgXCIgXCI7XG4gICAgICAgIGVhY2goY2xhc3NlcywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICBpZiAoaGFzQ2xhc3ModiwgYykpIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHYsIGMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRDbGFzcyh2LCBjLCBzcGFjZWROYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSB9KTtcblxuICBmbi5leHRlbmQoe1xuICAgIGFkZDogZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdW5pcXVlKGNhc2gubWVyZ2UodGhpcywgY2FzaChzZWxlY3RvciwgY29udGV4dCkpKTtcbiAgICB9LFxuXG4gICAgZWFjaDogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICBlYWNoKHRoaXMsIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBlcTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICByZXR1cm4gY2FzaCh0aGlzLmdldChpbmRleCkpO1xuICAgIH0sXG5cbiAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKHRoaXMsIChpc1N0cmluZyhzZWxlY3RvcikgPyBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hlcyhlLCBzZWxlY3Rvcik7XG4gICAgICB9IDogc2VsZWN0b3IpKTtcbiAgICB9LFxuXG4gICAgZmlyc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxKDApO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGluZGV4IDwgMCA/IHRoaXNbaW5kZXggKyB0aGlzLmxlbmd0aF0gOiB0aGlzW2luZGV4XSk7XG4gICAgfSxcblxuICAgIGluZGV4OiBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgdmFyIGYgPSB0aGlzWzBdO1xuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoZWxlbSA/IGNhc2goZWxlbSkgOiBjYXNoKGYpLnBhcmVudCgpLmNoaWxkcmVuKCkpLmluZGV4T2YoZik7XG4gICAgfSxcblxuICAgIGxhc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxKC0xKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgdmFyIGdldFByZWZpeGVkUHJvcCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhY2hlID0ge30sIGRpdiA9IGRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCBzdHlsZSA9IGRpdi5zdHlsZSwgY2FtZWxSZWdleCA9IC8oPzpeXFx3fFtBLVpdfFxcYlxcdykvZywgd2hpdGVTcGFjZSA9IC9cXHMrL2c7XG5cbiAgICBmdW5jdGlvbiBjYW1lbENhc2Uoc3RyKSB7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxSZWdleCwgZnVuY3Rpb24gKGxldHRlciwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGxldHRlcltpbmRleCA9PT0gMCA/IFwidG9Mb3dlckNhc2VcIiA6IFwidG9VcHBlckNhc2VcIl0oKTtcbiAgICAgIH0pLnJlcGxhY2Uod2hpdGVTcGFjZSwgXCJcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICBwcm9wID0gY2FtZWxDYXNlKHByb3ApO1xuICAgICAgaWYgKGNhY2hlW3Byb3BdKSB7XG4gICAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHVjUHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpLCBwcmVmaXhlcyA9IFtcIndlYmtpdFwiLCBcIm1velwiLCBcIm1zXCIsIFwib1wiXSwgcHJvcHMgPSAocHJvcCArIFwiIFwiICsgKHByZWZpeGVzKS5qb2luKHVjUHJvcCArIFwiIFwiKSArIHVjUHJvcCkuc3BsaXQoXCIgXCIpO1xuXG4gICAgICBlYWNoKHByb3BzLCBmdW5jdGlvbiAocCkge1xuICAgICAgICBpZiAocCBpbiBzdHlsZSkge1xuICAgICAgICAgIGNhY2hlW3BdID0gcHJvcCA9IGNhY2hlW3Byb3BdID0gcDtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgfTtcbiAgfSgpKTtcblxuICBmbi5leHRlbmQoe1xuICAgIGNzczogZnVuY3Rpb24gKHByb3AsIHZhbHVlKSB7XG4gICAgICBpZiAoaXNTdHJpbmcocHJvcCkpIHtcbiAgICAgICAgcHJvcCA9IGdldFByZWZpeGVkUHJvcChwcm9wKTtcbiAgICAgICAgcmV0dXJuICh2YWx1ZSA/IHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgIHJldHVybiB2LnN0eWxlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgIH0pIDogd2luLmdldENvbXB1dGVkU3R5bGUodGhpc1swXSlbcHJvcF0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gcHJvcCkge1xuICAgICAgICB0aGlzLmNzcyhrZXksIHByb3Bba2V5XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBjb21wdXRlKGVsLCBwcm9wKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHdpbi5nZXRDb21wdXRlZFN0eWxlKGVsWzBdLCBudWxsKVtwcm9wXSwgMTApIHx8IDA7XG4gIH1cblxuICBlYWNoKFtcIldpZHRoXCIsIFwiSGVpZ2h0XCJdLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBsb3dlciA9IHYudG9Mb3dlckNhc2UoKTtcblxuICAgIGZuW2xvd2VyXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW2xvd2VyXTtcbiAgICB9O1xuXG4gICAgZm5bXCJpbm5lclwiICsgdl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpc1swXVtcImNsaWVudFwiICsgdl07XG4gICAgfTtcblxuICAgIGZuW1wib3V0ZXJcIiArIHZdID0gZnVuY3Rpb24gKG1hcmdpbnMpIHtcbiAgICAgIHJldHVybiB0aGlzWzBdW1wib2Zmc2V0XCIgKyB2XSArIChtYXJnaW5zID8gY29tcHV0ZSh0aGlzLCBcIm1hcmdpblwiICsgKHYgPT09IFwiV2lkdGhcIiA/IFwiTGVmdFwiIDogXCJUb3BcIikpICsgY29tcHV0ZSh0aGlzLCBcIm1hcmdpblwiICsgKHYgPT09IFwiV2lkdGhcIiA/IFwiUmlnaHRcIiA6IFwiQm90dG9tXCIpKSA6IDApO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnQobm9kZSwgZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBldmVudENhY2hlID0gZ2V0RGF0YShub2RlLCBcIl9jYXNoRXZlbnRzXCIpIHx8IHNldERhdGEobm9kZSwgXCJfY2FzaEV2ZW50c1wiLCB7fSk7XG4gICAgZXZlbnRDYWNoZVtldmVudE5hbWVdID0gZXZlbnRDYWNoZVtldmVudE5hbWVdIHx8IFtdO1xuICAgIGV2ZW50Q2FjaGVbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVFdmVudChub2RlLCBldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGV2ZW50Q2FjaGUgPSBnZXREYXRhKG5vZGUsIFwiX2Nhc2hFdmVudHNcIilbZXZlbnROYW1lXTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWFjaChldmVudENhY2hlLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnQpO1xuICAgICAgfSk7XG4gICAgICBldmVudENhY2hlID0gW107XG4gICAgfVxuICB9XG5cbiAgZm4uZXh0ZW5kKHtcbiAgICBvZmY6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiByZW1vdmVFdmVudCh2LCBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGVsZWdhdGUsIGNhbGxiYWNrLCBydW5PbmNlKSB7XG4gICAgICB2YXIgb3JpZ2luYWxDYWxsYmFjaztcblxuICAgICAgaWYgKCFpc1N0cmluZyhldmVudE5hbWUpKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBldmVudE5hbWUpIHtcbiAgICAgICAgICB0aGlzLm9uKGtleSwgZGVsZWdhdGUsIGV2ZW50TmFtZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRnVuY3Rpb24oZGVsZWdhdGUpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZGVsZWdhdGU7XG4gICAgICAgIGRlbGVnYXRlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gXCJyZWFkeVwiKSB7XG4gICAgICAgIG9uUmVhZHkoY2FsbGJhY2spO3JldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgb3JpZ2luYWxDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyIHQgPSBlLnRhcmdldDtcblxuICAgICAgICAgIGlmIChtYXRjaGVzKHQsIGRlbGVnYXRlKSkge1xuICAgICAgICAgICAgb3JpZ2luYWxDYWxsYmFjay5jYWxsKHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoIW1hdGNoZXModCwgZGVsZWdhdGUpKSB7XG4gICAgICAgICAgICAgIGlmICh0ID09PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0ID0gZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHQgPSB0LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgIG9yaWdpbmFsQ2FsbGJhY2suY2FsbCh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIGZpbmFsQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgaWYgKHJ1bk9uY2UpIHtcbiAgICAgICAgICBmaW5hbENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50KHYsIGV2ZW50TmFtZSwgZmluYWxDYWxsYmFjayk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZWdpc3RlckV2ZW50KHYsIGV2ZW50TmFtZSwgZmluYWxDYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25lOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkZWxlZ2F0ZSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLm9uKGV2ZW50TmFtZSwgZGVsZWdhdGUsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgcmVhZHk6IG9uUmVhZHksXG5cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICB2YXIgZXZ0ID0gZG9jLmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcbiAgICAgIGV2dC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB2LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBlbmNvZGUobmFtZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gXCImXCIgKyBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkucmVwbGFjZSgvJTIwL2csIFwiK1wiKTtcbiAgfVxuICBmdW5jdGlvbiBpc0NoZWNrYWJsZShmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC50eXBlID09PSBcInJhZGlvXCIgfHwgZmllbGQudHlwZSA9PT0gXCJjaGVja2JveFwiO1xuICB9XG5cbiAgdmFyIGZvcm1FeGNsdWRlcyA9IFtcImZpbGVcIiwgXCJyZXNldFwiLCBcInN1Ym1pdFwiLCBcImJ1dHRvblwiXTtcblxuICBmbi5leHRlbmQoe1xuICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZvcm1FbCA9IHRoaXNbMF0uZWxlbWVudHMsIHF1ZXJ5ID0gXCJcIjtcblxuICAgICAgZWFjaChmb3JtRWwsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICBpZiAoZmllbGQubmFtZSAmJiBmb3JtRXhjbHVkZXMuaW5kZXhPZihmaWVsZC50eXBlKSA8IDApIHtcbiAgICAgICAgICBpZiAoZmllbGQudHlwZSA9PT0gXCJzZWxlY3QtbXVsdGlwbGVcIikge1xuICAgICAgICAgICAgZWFjaChmaWVsZC5vcHRpb25zLCBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICBpZiAoby5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5ICs9IGVuY29kZShmaWVsZC5uYW1lLCBvLnZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICghaXNDaGVja2FibGUoZmllbGQpIHx8IChpc0NoZWNrYWJsZShmaWVsZCkgJiYgZmllbGQuY2hlY2tlZCkpIHtcbiAgICAgICAgICAgIHF1ZXJ5ICs9IGVuY29kZShmaWVsZC5uYW1lLCBmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHF1ZXJ5LnN1YnN0cigxKTtcbiAgICB9LFxuXG4gICAgdmFsOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdLnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgIHJldHVybiB2LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBpbnNlcnRFbGVtZW50KGVsLCBjaGlsZCwgcHJlcGVuZCkge1xuICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICB2YXIgZmlyc3QgPSBlbC5jaGlsZE5vZGVzWzBdO1xuICAgICAgZWwuaW5zZXJ0QmVmb3JlKGNoaWxkLCBmaXJzdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnNlcnRDb250ZW50KHBhcmVudCwgY2hpbGQsIHByZXBlbmQpIHtcbiAgICB2YXIgc3RyID0gaXNTdHJpbmcoY2hpbGQpO1xuXG4gICAgaWYgKCFzdHIgJiYgY2hpbGQubGVuZ3RoKSB7XG4gICAgICBlYWNoKGNoaWxkLCBmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gaW5zZXJ0Q29udGVudChwYXJlbnQsIHYsIHByZXBlbmQpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWFjaChwYXJlbnQsIHN0ciA/IGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdi5pbnNlcnRBZGphY2VudEhUTUwocHJlcGVuZCA/IFwiYWZ0ZXJiZWdpblwiIDogXCJiZWZvcmVlbmRcIiwgY2hpbGQpO1xuICAgIH0gOiBmdW5jdGlvbiAodiwgaSkge1xuICAgICAgcmV0dXJuIGluc2VydEVsZW1lbnQodiwgKGkgPT09IDAgPyBjaGlsZCA6IGNoaWxkLmNsb25lTm9kZSh0cnVlKSksIHByZXBlbmQpO1xuICAgIH0pO1xuICB9XG5cbiAgZm4uZXh0ZW5kKHtcbiAgICBhZnRlcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICBjYXNoKHNlbGVjdG9yKS5pbnNlcnRBZnRlcih0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgICBpbnNlcnRDb250ZW50KHRoaXMsIGNvbnRlbnQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGFwcGVuZFRvOiBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgICBpbnNlcnRDb250ZW50KGNhc2gocGFyZW50KSwgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgYmVmb3JlOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgIGNhc2goc2VsZWN0b3IpLmluc2VydEJlZm9yZSh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNhc2godGhpcy5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIHYuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBlbXB0eTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5odG1sKFwiXCIpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGh0bWw6IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdLmlubmVySFRNTDtcbiAgICAgIH1cbiAgICAgIHZhciBzb3VyY2UgPSAoY29udGVudC5ub2RlVHlwZSA/IGNvbnRlbnRbMF0ub3V0ZXJIVE1MIDogY29udGVudCk7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB2LmlubmVySFRNTCA9IHNvdXJjZTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBpbnNlcnRBZnRlcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG5cbiAgICAgIGNhc2goc2VsZWN0b3IpLmVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlLCBzaWJsaW5nID0gZWwubmV4dFNpYmxpbmc7XG4gICAgICAgIF90aGlzLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKChpID09PSAwID8gdiA6IHYuY2xvbmVOb2RlKHRydWUpKSwgc2libGluZyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG4gICAgICBjYXNoKHNlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgX3RoaXMyLmVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKChpID09PSAwID8gdiA6IHYuY2xvbmVOb2RlKHRydWUpKSwgZWwpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHByZXBlbmQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgICBpbnNlcnRDb250ZW50KHRoaXMsIGNvbnRlbnQsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHByZXBlbmRUbzogZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgaW5zZXJ0Q29udGVudChjYXNoKHBhcmVudCksIHRoaXMsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHYpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRleHQ6IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0udGV4dENvbnRlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB2LnRleHRDb250ZW50ID0gY29udGVudDtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcblxuICB2YXIgZG9jRWwgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG4gIGZuLmV4dGVuZCh7XG4gICAgcG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXNbMF07XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBlbC5vZmZzZXRMZWZ0LFxuICAgICAgICB0b3A6IGVsLm9mZnNldFRvcFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb2Zmc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVjdCA9IHRoaXNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luLnBhZ2VZT2Zmc2V0IC0gZG9jRWwuY2xpZW50VG9wLFxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW4ucGFnZVhPZmZzZXQgLSBkb2NFbC5jbGllbnRMZWZ0XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvZmZzZXRQYXJlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjYXNoKHRoaXNbMF0ub2Zmc2V0UGFyZW50KTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZGlyZWN0Q29tcGFyZShlbCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZWwgPT09IHNlbGVjdG9yO1xuICB9XG5cbiAgZm4uZXh0ZW5kKHtcbiAgICBjaGlsZHJlbjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgZWxlbXMgPSBbXTtcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcHVzaC5hcHBseShlbGVtcywgZWwuY2hpbGRyZW4pO1xuICAgICAgfSk7XG4gICAgICBlbGVtcyA9IHVuaXF1ZShlbGVtcyk7XG5cbiAgICAgIHJldHVybiAoIXNlbGVjdG9yID8gZWxlbXMgOiBlbGVtcy5maWx0ZXIoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZXModiwgc2VsZWN0b3IpO1xuICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBjbG9zZXN0OiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgIGlmICghc2VsZWN0b3IgfHwgbWF0Y2hlcyh0aGlzWzBdLCBzZWxlY3RvcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQoKS5jbG9zZXN0KHNlbGVjdG9yKTtcbiAgICB9LFxuXG4gICAgaXM6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXRjaCA9IGZhbHNlLCBjb21wYXJhdG9yID0gKGlzU3RyaW5nKHNlbGVjdG9yKSA/IG1hdGNoZXMgOiBzZWxlY3Rvci5jYXNoID8gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rvci5pcyhlbCk7XG4gICAgICB9IDogZGlyZWN0Q29tcGFyZSk7XG5cbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcbiAgICAgICAgbWF0Y2ggPSBjb21wYXJhdG9yKGVsLCBzZWxlY3RvciwgaSk7XG4gICAgICAgIHJldHVybiAhbWF0Y2g7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGNhc2goKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGVsZW1zID0gW107XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHB1c2guYXBwbHkoZWxlbXMsIGZpbmQoc2VsZWN0b3IsIGVsKSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHVuaXF1ZShlbGVtcyk7XG4gICAgfSxcblxuICAgIGhhczogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcywgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBjYXNoKGVsKS5maW5kKHNlbGVjdG9yKS5sZW5ndGggIT09IDA7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNhc2godGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgIH0sXG5cbiAgICBub3Q6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKHRoaXMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gIW1hdGNoZXMoZWwsIHNlbGVjdG9yKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBwYXJlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5wYXJlbnRFbGVtZW50IHx8IGRvYy5ib2R5LnBhcmVudE5vZGU7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHVuaXF1ZShyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBwYXJlbnRzOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgIHZhciBsYXN0LCByZXN1bHQgPSBbXTtcblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIGxhc3QgPSBpdGVtO1xuXG4gICAgICAgIHdoaWxlIChsYXN0ICE9PSBkb2MuYm9keS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgbGFzdCA9IGxhc3QucGFyZW50RWxlbWVudDtcblxuICAgICAgICAgIGlmICghc2VsZWN0b3IgfHwgKHNlbGVjdG9yICYmIG1hdGNoZXMobGFzdCwgc2VsZWN0b3IpKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gobGFzdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHVuaXF1ZShyZXN1bHQpO1xuICAgIH0sXG5cbiAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY2FzaCh0aGlzWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpO1xuICAgIH0sXG5cbiAgICBzaWJsaW5nczogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzLnBhcmVudCgpLmNoaWxkcmVuKCksIGVsID0gdGhpc1swXTtcblxuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKGNvbGxlY3Rpb24sIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHJldHVybiBpICE9PSBlbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcblxuXG4gIHJldHVybiBjYXNoO1xufSk7IiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcblxuLyoqXG4gKiBVc2UgY2hyb21lLnN0b3JhZ2UubG9jYWwgaWYgd2UgYXJlIGluIGFuIGFwcFxuICovXG5cbnZhciBzdG9yYWdlO1xuXG5pZiAodHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZS5zdG9yYWdlICE9PSAndW5kZWZpbmVkJylcbiAgc3RvcmFnZSA9IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xuZWxzZVxuICBzdG9yYWdlID0gbG9jYWxzdG9yYWdlKCk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbmV4cG9ydHMuY29sb3JzID0gW1xuICAnbGlnaHRzZWFncmVlbicsXG4gICdmb3Jlc3RncmVlbicsXG4gICdnb2xkZW5yb2QnLFxuICAnZG9kZ2VyYmx1ZScsXG4gICdkYXJrb3JjaGlkJyxcbiAgJ2NyaW1zb24nXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgcmV0dXJuICgnV2Via2l0QXBwZWFyYW5jZScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAod2luZG93LmNvbnNvbGUgJiYgKGNvbnNvbGUuZmlyZWJ1ZyB8fCAoY29uc29sZS5leGNlcHRpb24gJiYgY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgIChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2ZpcmVmb3hcXC8oXFxkKykvKSAmJiBwYXJzZUludChSZWdFeHAuJDEsIDEwKSA+PSAzMSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncygpIHtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybiBhcmdzO1xuXG4gIHZhciBjID0gJ2NvbG9yOiAnICsgdGhpcy5jb2xvcjtcbiAgYXJncyA9IFthcmdzWzBdLCBjLCAnY29sb3I6IGluaGVyaXQnXS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywgMSkpO1xuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xuICByZXR1cm4gYXJncztcbn1cblxuLyoqXG4gKiBJbnZva2VzIGBjb25zb2xlLmxvZygpYCB3aGVuIGF2YWlsYWJsZS5cbiAqIE5vLW9wIHdoZW4gYGNvbnNvbGUubG9nYCBpcyBub3QgYSBcImZ1bmN0aW9uXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBsb2coKSB7XG4gIC8vIHRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4LzksIHdoZXJlXG4gIC8vIHRoZSBgY29uc29sZS5sb2dgIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gIHJldHVybiAnb2JqZWN0JyA9PT0gdHlwZW9mIGNvbnNvbGVcbiAgICAmJiBjb25zb2xlLmxvZ1xuICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIFNhdmUgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAobnVsbCA9PSBuYW1lc3BhY2VzKSB7XG4gICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBzdG9yYWdlLmRlYnVnO1xuICB9IGNhdGNoKGUpIHt9XG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cbiIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXJjYXNlZCBsZXR0ZXIsIGkuZS4gXCJuXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogUHJldmlvdXNseSBhc3NpZ25lZCBjb2xvci5cbiAqL1xuXG52YXIgcHJldkNvbG9yID0gMDtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcigpIHtcbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW3ByZXZDb2xvcisrICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZXNwYWNlKSB7XG5cbiAgLy8gZGVmaW5lIHRoZSBgZGlzYWJsZWRgIHZlcnNpb25cbiAgZnVuY3Rpb24gZGlzYWJsZWQoKSB7XG4gIH1cbiAgZGlzYWJsZWQuZW5hYmxlZCA9IGZhbHNlO1xuXG4gIC8vIGRlZmluZSB0aGUgYGVuYWJsZWRgIHZlcnNpb25cbiAgZnVuY3Rpb24gZW5hYmxlZCgpIHtcblxuICAgIHZhciBzZWxmID0gZW5hYmxlZDtcblxuICAgIC8vIHNldCBgZGlmZmAgdGltZXN0YW1wXG4gICAgdmFyIGN1cnIgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZUaW1lIHx8IGN1cnIpO1xuICAgIHNlbGYuZGlmZiA9IG1zO1xuICAgIHNlbGYucHJldiA9IHByZXZUaW1lO1xuICAgIHNlbGYuY3VyciA9IGN1cnI7XG4gICAgcHJldlRpbWUgPSBjdXJyO1xuXG4gICAgLy8gYWRkIHRoZSBgY29sb3JgIGlmIG5vdCBzZXRcbiAgICBpZiAobnVsbCA9PSBzZWxmLnVzZUNvbG9ycykgc2VsZi51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICAgIGlmIChudWxsID09IHNlbGYuY29sb3IgJiYgc2VsZi51c2VDb2xvcnMpIHNlbGYuY29sb3IgPSBzZWxlY3RDb2xvcigpO1xuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJW9cbiAgICAgIGFyZ3MgPSBbJyVvJ10uY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIC8vIGFwcGx5IGFueSBgZm9ybWF0dGVyc2AgdHJhbnNmb3JtYXRpb25zXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBhcmdzWzBdID0gYXJnc1swXS5yZXBsYWNlKC8lKFthLXolXSkvZywgZnVuY3Rpb24obWF0Y2gsIGZvcm1hdCkge1xuICAgICAgLy8gaWYgd2UgZW5jb3VudGVyIGFuIGVzY2FwZWQgJSB0aGVuIGRvbid0IGluY3JlYXNlIHRoZSBhcnJheSBpbmRleFxuICAgICAgaWYgKG1hdGNoID09PSAnJSUnKSByZXR1cm4gbWF0Y2g7XG4gICAgICBpbmRleCsrO1xuICAgICAgdmFyIGZvcm1hdHRlciA9IGV4cG9ydHMuZm9ybWF0dGVyc1tmb3JtYXRdO1xuICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmb3JtYXR0ZXIpIHtcbiAgICAgICAgdmFyIHZhbCA9IGFyZ3NbaW5kZXhdO1xuICAgICAgICBtYXRjaCA9IGZvcm1hdHRlci5jYWxsKHNlbGYsIHZhbCk7XG5cbiAgICAgICAgLy8gbm93IHdlIG5lZWQgdG8gcmVtb3ZlIGBhcmdzW2luZGV4XWAgc2luY2UgaXQncyBpbmxpbmVkIGluIHRoZSBgZm9ybWF0YFxuICAgICAgICBhcmdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGluZGV4LS07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuZm9ybWF0QXJncykge1xuICAgICAgYXJncyA9IGV4cG9ydHMuZm9ybWF0QXJncy5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9XG4gICAgdmFyIGxvZ0ZuID0gZW5hYmxlZC5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuICBlbmFibGVkLmVuYWJsZWQgPSB0cnVlO1xuXG4gIHZhciBmbiA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpID8gZW5hYmxlZCA6IGRpc2FibGVkO1xuXG4gIGZuLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcblxuICByZXR1cm4gZm47XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWVzcGFjZXMgfHwgJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghc3BsaXRbaV0pIGNvbnRpbnVlOyAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgIG5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywgJy4qPycpO1xuICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgIGV4cG9ydHMuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIGV4cG9ydHMuZW5hYmxlKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnanNvbnAnKTtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpzb25wO1xuXG4vKipcbiAqIENhbGxiYWNrIGluZGV4LlxuICovXG5cbnZhciBjb3VudCA9IDA7XG5cbi8qKlxuICogTm9vcCBmdW5jdGlvbi5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fVxuXG4vKipcbiAqIEpTT05QIGhhbmRsZXJcbiAqXG4gKiBPcHRpb25zOlxuICogIC0gcGFyYW0ge1N0cmluZ30gcXMgcGFyYW1ldGVyIChgY2FsbGJhY2tgKVxuICogIC0gcHJlZml4IHtTdHJpbmd9IHFzIHBhcmFtZXRlciAoYF9fanBgKVxuICogIC0gbmFtZSB7U3RyaW5nfSBxcyBwYXJhbWV0ZXIgKGBwcmVmaXhgICsgaW5jcilcbiAqICAtIHRpbWVvdXQge051bWJlcn0gaG93IGxvbmcgYWZ0ZXIgYSB0aW1lb3V0IGVycm9yIGlzIGVtaXR0ZWQgKGA2MDAwMGApXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdGlvbmFsIG9wdGlvbnMgLyBjYWxsYmFja1xuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9uYWwgY2FsbGJhY2tcbiAqL1xuXG5mdW5jdGlvbiBqc29ucCh1cmwsIG9wdHMsIGZuKXtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIG9wdHMpIHtcbiAgICBmbiA9IG9wdHM7XG4gICAgb3B0cyA9IHt9O1xuICB9XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuXG4gIHZhciBwcmVmaXggPSBvcHRzLnByZWZpeCB8fCAnX19qcCc7XG5cbiAgLy8gdXNlIHRoZSBjYWxsYmFjayBuYW1lIHRoYXQgd2FzIHBhc3NlZCBpZiBvbmUgd2FzIHByb3ZpZGVkLlxuICAvLyBvdGhlcndpc2UgZ2VuZXJhdGUgYSB1bmlxdWUgbmFtZSBieSBpbmNyZW1lbnRpbmcgb3VyIGNvdW50ZXIuXG4gIHZhciBpZCA9IG9wdHMubmFtZSB8fCAocHJlZml4ICsgKGNvdW50KyspKTtcblxuICB2YXIgcGFyYW0gPSBvcHRzLnBhcmFtIHx8ICdjYWxsYmFjayc7XG4gIHZhciB0aW1lb3V0ID0gbnVsbCAhPSBvcHRzLnRpbWVvdXQgPyBvcHRzLnRpbWVvdXQgOiA2MDAwMDtcbiAgdmFyIGVuYyA9IGVuY29kZVVSSUNvbXBvbmVudDtcbiAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSB8fCBkb2N1bWVudC5oZWFkO1xuICB2YXIgc2NyaXB0O1xuICB2YXIgdGltZXI7XG5cblxuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgY2xlYW51cCgpO1xuICAgICAgaWYgKGZuKSBmbihuZXcgRXJyb3IoJ1RpbWVvdXQnKSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwKCl7XG4gICAgaWYgKHNjcmlwdC5wYXJlbnROb2RlKSBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgIHdpbmRvd1tpZF0gPSBub29wO1xuICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpe1xuICAgIGlmICh3aW5kb3dbaWRdKSB7XG4gICAgICBjbGVhbnVwKCk7XG4gICAgfVxuICB9XG5cbiAgd2luZG93W2lkXSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgIGRlYnVnKCdqc29ucCBnb3QnLCBkYXRhKTtcbiAgICBjbGVhbnVwKCk7XG4gICAgaWYgKGZuKSBmbihudWxsLCBkYXRhKTtcbiAgfTtcblxuICAvLyBhZGQgcXMgY29tcG9uZW50XG4gIHVybCArPSAofnVybC5pbmRleE9mKCc/JykgPyAnJicgOiAnPycpICsgcGFyYW0gKyAnPScgKyBlbmMoaWQpO1xuICB1cmwgPSB1cmwucmVwbGFjZSgnPyYnLCAnPycpO1xuXG4gIGRlYnVnKCdqc29ucCByZXEgXCIlc1wiJywgdXJsKTtcblxuICAvLyBjcmVhdGUgc2NyaXB0XG4gIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQuc3JjID0gdXJsO1xuICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2NyaXB0LCB0YXJnZXQpO1xuXG4gIHJldHVybiBjYW5jZWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKXtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgdmFsKSByZXR1cm4gcGFyc2UodmFsKTtcbiAgcmV0dXJuIG9wdGlvbnMubG9uZ1xuICAgID8gbG9uZyh2YWwpXG4gICAgOiBzaG9ydCh2YWwpO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuO1xuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgaWYgKG1zID49IGgpIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCc7XG4gIGlmIChtcyA+PSBtKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICBpZiAobXMgPj0gcykgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpXG4gICAgfHwgcGx1cmFsKG1zLCBoLCAnaG91cicpXG4gICAgfHwgcGx1cmFsKG1zLCBtLCAnbWludXRlJylcbiAgICB8fCBwbHVyYWwobXMsIHMsICdzZWNvbmQnKVxuICAgIHx8IG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHJldHVybjtcbiAgaWYgKG1zIDwgbiAqIDEuNSkgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWU7XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIvKiFcbiAqIG11c3RhY2hlLmpzIC0gTG9naWMtbGVzcyB7e211c3RhY2hlfX0gdGVtcGxhdGVzIHdpdGggSmF2YVNjcmlwdFxuICogaHR0cDovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qc1xuICovXG5cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UgTXVzdGFjaGU6IHRydWUqL1xuXG4oZnVuY3Rpb24gZGVmaW5lTXVzdGFjaGUgKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgdHlwZW9mIGV4cG9ydHMubm9kZU5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgZmFjdG9yeShleHBvcnRzKTsgLy8gQ29tbW9uSlNcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpOyAvLyBBTURcbiAgfSBlbHNlIHtcbiAgICBnbG9iYWwuTXVzdGFjaGUgPSB7fTtcbiAgICBmYWN0b3J5KGdsb2JhbC5NdXN0YWNoZSk7IC8vIHNjcmlwdCwgd3NoLCBhc3BcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiBtdXN0YWNoZUZhY3RvcnkgKG11c3RhY2hlKSB7XG5cbiAgdmFyIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXlQb2x5ZmlsbCAob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBmdW5jdGlvbiBpc0Z1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3JlIGNvcnJlY3QgdHlwZW9mIHN0cmluZyBoYW5kbGluZyBhcnJheVxuICAgKiB3aGljaCBub3JtYWxseSByZXR1cm5zIHR5cGVvZiAnb2JqZWN0J1xuICAgKi9cbiAgZnVuY3Rpb24gdHlwZVN0ciAob2JqKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkob2JqKSA/ICdhcnJheScgOiB0eXBlb2Ygb2JqO1xuICB9XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXhwIChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1tcXC1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLCAnXFxcXCQmJyk7XG4gIH1cblxuICAvKipcbiAgICogTnVsbCBzYWZlIHdheSBvZiBjaGVja2luZyB3aGV0aGVyIG9yIG5vdCBhbiBvYmplY3QsXG4gICAqIGluY2x1ZGluZyBpdHMgcHJvdG90eXBlLCBoYXMgYSBnaXZlbiBwcm9wZXJ0eVxuICAgKi9cbiAgZnVuY3Rpb24gaGFzUHJvcGVydHkgKG9iaiwgcHJvcE5hbWUpIHtcbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgKHByb3BOYW1lIGluIG9iaik7XG4gIH1cblxuICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2lzc3Vlcy5hcGFjaGUub3JnL2ppcmEvYnJvd3NlL0NPVUNIREItNTc3XG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg5XG4gIHZhciByZWdFeHBUZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xuICBmdW5jdGlvbiB0ZXN0UmVnRXhwIChyZSwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIHJlZ0V4cFRlc3QuY2FsbChyZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBub25TcGFjZVJlID0gL1xcUy87XG4gIGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSAoc3RyaW5nKSB7XG4gICAgcmV0dXJuICF0ZXN0UmVnRXhwKG5vblNwYWNlUmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnLyc6ICcmI3gyRjsnLFxuICAgICdgJzogJyYjeDYwOycsXG4gICAgJz0nOiAnJiN4M0Q7J1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZUh0bWwgKHN0cmluZykge1xuICAgIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKC9bJjw+XCInYD1cXC9dL2csIGZ1bmN0aW9uIGZyb21FbnRpdHlNYXAgKHMpIHtcbiAgICAgIHJldHVybiBlbnRpdHlNYXBbc107XG4gICAgfSk7XG4gIH1cblxuICB2YXIgd2hpdGVSZSA9IC9cXHMqLztcbiAgdmFyIHNwYWNlUmUgPSAvXFxzKy87XG4gIHZhciBlcXVhbHNSZSA9IC9cXHMqPS87XG4gIHZhciBjdXJseVJlID0gL1xccypcXH0vO1xuICB2YXIgdGFnUmUgPSAvI3xcXF58XFwvfD58XFx7fCZ8PXwhLztcblxuICAvKipcbiAgICogQnJlYWtzIHVwIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHN0cmluZyBpbnRvIGEgdHJlZSBvZiB0b2tlbnMuIElmIHRoZSBgdGFnc2BcbiAgICogYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvIHN0cmluZyB2YWx1ZXM6IHRoZVxuICAgKiBvcGVuaW5nIGFuZCBjbG9zaW5nIHRhZ3MgdXNlZCBpbiB0aGUgdGVtcGxhdGUgKGUuZy4gWyBcIjwlXCIsIFwiJT5cIiBdKS4gT2ZcbiAgICogY291cnNlLCB0aGUgZGVmYXVsdCBpcyB0byB1c2UgbXVzdGFjaGVzIChpLmUuIG11c3RhY2hlLnRhZ3MpLlxuICAgKlxuICAgKiBBIHRva2VuIGlzIGFuIGFycmF5IHdpdGggYXQgbGVhc3QgNCBlbGVtZW50cy4gVGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlXG4gICAqIG11c3RhY2hlIHN5bWJvbCB0aGF0IHdhcyB1c2VkIGluc2lkZSB0aGUgdGFnLCBlLmcuIFwiI1wiIG9yIFwiJlwiLiBJZiB0aGUgdGFnXG4gICAqIGRpZCBub3QgY29udGFpbiBhIHN5bWJvbCAoaS5lLiB7e215VmFsdWV9fSkgdGhpcyBlbGVtZW50IGlzIFwibmFtZVwiLiBGb3JcbiAgICogYWxsIHRleHQgdGhhdCBhcHBlYXJzIG91dHNpZGUgYSBzeW1ib2wgdGhpcyBlbGVtZW50IGlzIFwidGV4dFwiLlxuICAgKlxuICAgKiBUaGUgc2Vjb25kIGVsZW1lbnQgb2YgYSB0b2tlbiBpcyBpdHMgXCJ2YWx1ZVwiLiBGb3IgbXVzdGFjaGUgdGFncyB0aGlzIGlzXG4gICAqIHdoYXRldmVyIGVsc2Ugd2FzIGluc2lkZSB0aGUgdGFnIGJlc2lkZXMgdGhlIG9wZW5pbmcgc3ltYm9sLiBGb3IgdGV4dCB0b2tlbnNcbiAgICogdGhpcyBpcyB0aGUgdGV4dCBpdHNlbGYuXG4gICAqXG4gICAqIFRoZSB0aGlyZCBhbmQgZm91cnRoIGVsZW1lbnRzIG9mIHRoZSB0b2tlbiBhcmUgdGhlIHN0YXJ0IGFuZCBlbmQgaW5kaWNlcyxcbiAgICogcmVzcGVjdGl2ZWx5LCBvZiB0aGUgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIHRlbXBsYXRlLlxuICAgKlxuICAgKiBUb2tlbnMgdGhhdCBhcmUgdGhlIHJvb3Qgbm9kZSBvZiBhIHN1YnRyZWUgY29udGFpbiB0d28gbW9yZSBlbGVtZW50czogMSkgYW5cbiAgICogYXJyYXkgb2YgdG9rZW5zIGluIHRoZSBzdWJ0cmVlIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGF0XG4gICAqIHdoaWNoIHRoZSBjbG9zaW5nIHRhZyBmb3IgdGhhdCBzZWN0aW9uIGJlZ2lucy5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgaWYgKCF0ZW1wbGF0ZSlcbiAgICAgIHJldHVybiBbXTtcblxuICAgIHZhciBzZWN0aW9ucyA9IFtdOyAgICAgLy8gU3RhY2sgdG8gaG9sZCBzZWN0aW9uIHRva2Vuc1xuICAgIHZhciB0b2tlbnMgPSBbXTsgICAgICAgLy8gQnVmZmVyIHRvIGhvbGQgdGhlIHRva2Vuc1xuICAgIHZhciBzcGFjZXMgPSBbXTsgICAgICAgLy8gSW5kaWNlcyBvZiB3aGl0ZXNwYWNlIHRva2VucyBvbiB0aGUgY3VycmVudCBsaW5lXG4gICAgdmFyIGhhc1RhZyA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIHt7dGFnfX0gb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICB2YXIgbm9uU3BhY2UgPSBmYWxzZTsgIC8vIElzIHRoZXJlIGEgbm9uLXNwYWNlIGNoYXIgb24gdGhlIGN1cnJlbnQgbGluZT9cblxuICAgIC8vIFN0cmlwcyBhbGwgd2hpdGVzcGFjZSB0b2tlbnMgYXJyYXkgZm9yIHRoZSBjdXJyZW50IGxpbmVcbiAgICAvLyBpZiB0aGVyZSB3YXMgYSB7eyN0YWd9fSBvbiBpdCBhbmQgb3RoZXJ3aXNlIG9ubHkgc3BhY2UuXG4gICAgZnVuY3Rpb24gc3RyaXBTcGFjZSAoKSB7XG4gICAgICBpZiAoaGFzVGFnICYmICFub25TcGFjZSkge1xuICAgICAgICB3aGlsZSAoc3BhY2VzLmxlbmd0aClcbiAgICAgICAgICBkZWxldGUgdG9rZW5zW3NwYWNlcy5wb3AoKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgaGFzVGFnID0gZmFsc2U7XG4gICAgICBub25TcGFjZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBvcGVuaW5nVGFnUmUsIGNsb3NpbmdUYWdSZSwgY2xvc2luZ0N1cmx5UmU7XG4gICAgZnVuY3Rpb24gY29tcGlsZVRhZ3MgKHRhZ3NUb0NvbXBpbGUpIHtcbiAgICAgIGlmICh0eXBlb2YgdGFnc1RvQ29tcGlsZSA9PT0gJ3N0cmluZycpXG4gICAgICAgIHRhZ3NUb0NvbXBpbGUgPSB0YWdzVG9Db21waWxlLnNwbGl0KHNwYWNlUmUsIDIpO1xuXG4gICAgICBpZiAoIWlzQXJyYXkodGFnc1RvQ29tcGlsZSkgfHwgdGFnc1RvQ29tcGlsZS5sZW5ndGggIT09IDIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0YWdzOiAnICsgdGFnc1RvQ29tcGlsZSk7XG5cbiAgICAgIG9wZW5pbmdUYWdSZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXhwKHRhZ3NUb0NvbXBpbGVbMF0pICsgJ1xcXFxzKicpO1xuICAgICAgY2xvc2luZ1RhZ1JlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCh0YWdzVG9Db21waWxlWzFdKSk7XG4gICAgICBjbG9zaW5nQ3VybHlSZSA9IG5ldyBSZWdFeHAoJ1xcXFxzKicgKyBlc2NhcGVSZWdFeHAoJ30nICsgdGFnc1RvQ29tcGlsZVsxXSkpO1xuICAgIH1cblxuICAgIGNvbXBpbGVUYWdzKHRhZ3MgfHwgbXVzdGFjaGUudGFncyk7XG5cbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBTY2FubmVyKHRlbXBsYXRlKTtcblxuICAgIHZhciBzdGFydCwgdHlwZSwgdmFsdWUsIGNociwgdG9rZW4sIG9wZW5TZWN0aW9uO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb3MoKSkge1xuICAgICAgc3RhcnQgPSBzY2FubmVyLnBvcztcblxuICAgICAgLy8gTWF0Y2ggYW55IHRleHQgYmV0d2VlbiB0YWdzLlxuICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChvcGVuaW5nVGFnUmUpO1xuXG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgdmFsdWVMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNociA9IHZhbHVlLmNoYXJBdChpKTtcblxuICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoY2hyKSkge1xuICAgICAgICAgICAgc3BhY2VzLnB1c2godG9rZW5zLmxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0b2tlbnMucHVzaChbICd0ZXh0JywgY2hyLCBzdGFydCwgc3RhcnQgKyAxIF0pO1xuICAgICAgICAgIHN0YXJ0ICs9IDE7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGVzcGFjZSBvbiB0aGUgY3VycmVudCBsaW5lLlxuICAgICAgICAgIGlmIChjaHIgPT09ICdcXG4nKVxuICAgICAgICAgICAgc3RyaXBTcGFjZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBvcGVuaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKG9wZW5pbmdUYWdSZSkpXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBoYXNUYWcgPSB0cnVlO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB0eXBlLlxuICAgICAgdHlwZSA9IHNjYW5uZXIuc2Nhbih0YWdSZSkgfHwgJ25hbWUnO1xuICAgICAgc2Nhbm5lci5zY2FuKHdoaXRlUmUpO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB2YWx1ZS5cbiAgICAgIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhbihlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd7Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdDdXJseVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGN1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgICB0eXBlID0gJyYnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgY2xvc2luZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2NhbihjbG9zaW5nVGFnUmUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHRhZyBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgICB0b2tlbiA9IFsgdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvcyBdO1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuXG4gICAgICBpZiAodHlwZSA9PT0gJyMnIHx8IHR5cGUgPT09ICdeJykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJy8nKSB7XG4gICAgICAgIC8vIENoZWNrIHNlY3Rpb24gbmVzdGluZy5cbiAgICAgICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcblxuICAgICAgICBpZiAoIW9wZW5TZWN0aW9uKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5vcGVuZWQgc2VjdGlvbiBcIicgKyB2YWx1ZSArICdcIiBhdCAnICsgc3RhcnQpO1xuXG4gICAgICAgIGlmIChvcGVuU2VjdGlvblsxXSAhPT0gdmFsdWUpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzdGFydCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICduYW1lJyB8fCB0eXBlID09PSAneycgfHwgdHlwZSA9PT0gJyYnKSB7XG4gICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJz0nKSB7XG4gICAgICAgIC8vIFNldCB0aGUgdGFncyBmb3IgdGhlIG5leHQgdGltZSBhcm91bmQuXG4gICAgICAgIGNvbXBpbGVUYWdzKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICBpZiAob3BlblNlY3Rpb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lcyB0aGUgdmFsdWVzIG9mIGNvbnNlY3V0aXZlIHRleHQgdG9rZW5zIGluIHRoZSBnaXZlbiBgdG9rZW5zYCBhcnJheVxuICAgKiB0byBhIHNpbmdsZSB0b2tlbi5cbiAgICovXG4gIGZ1bmN0aW9uIHNxdWFzaFRva2VucyAodG9rZW5zKSB7XG4gICAgdmFyIHNxdWFzaGVkVG9rZW5zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIGxhc3RUb2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlblswXSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbiAmJiBsYXN0VG9rZW5bMF0gPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlblsxXSArPSB0b2tlblsxXTtcbiAgICAgICAgICBsYXN0VG9rZW5bM10gPSB0b2tlblszXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgaW50byBhIG5lc3RlZCB0cmVlIHN0cnVjdHVyZSB3aGVyZVxuICAgKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gICAqIGFsbCB0b2tlbnMgdGhhdCBhcHBlYXIgaW4gdGhhdCBzZWN0aW9uIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsXG4gICAqIHRlbXBsYXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgZW5kIG9mIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG5lc3RUb2tlbnMgKHRva2Vucykge1xuICAgIHZhciBuZXN0ZWRUb2tlbnMgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gbmVzdGVkVG9rZW5zO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBzZWN0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgY29sbGVjdG9yID0gdG9rZW5bNF0gPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuICAgICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bNF0gOiBuZXN0ZWRUb2tlbnM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXN0ZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgc3RyaW5nIHNjYW5uZXIgdGhhdCBpcyB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSBwYXJzZXIgdG8gZmluZFxuICAgKiB0b2tlbnMgaW4gdGVtcGxhdGUgc3RyaW5ncy5cbiAgICovXG4gIGZ1bmN0aW9uIFNjYW5uZXIgKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gZW9zICgpIHtcbiAgICByZXR1cm4gdGhpcy50YWlsID09PSAnJztcbiAgfTtcblxuICAvKipcbiAgICogVHJpZXMgdG8gbWF0Y2ggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogUmV0dXJucyB0aGUgbWF0Y2hlZCB0ZXh0IGlmIGl0IGNhbiBtYXRjaCwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2UuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gc2NhbiAocmUpIHtcbiAgICB2YXIgbWF0Y2ggPSB0aGlzLnRhaWwubWF0Y2gocmUpO1xuXG4gICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCAhPT0gMClcbiAgICAgIHJldHVybiAnJztcblxuICAgIHZhciBzdHJpbmcgPSBtYXRjaFswXTtcblxuICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCk7XG4gICAgdGhpcy5wb3MgKz0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNraXBzIGFsbCB0ZXh0IHVudGlsIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGJlIG1hdGNoZWQuIFJldHVybnNcbiAgICogdGhlIHNraXBwZWQgc3RyaW5nLCB3aGljaCBpcyB0aGUgZW50aXJlIHRhaWwgaWYgbm8gbWF0Y2ggY2FuIGJlIG1hZGUuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuVW50aWwgPSBmdW5jdGlvbiBzY2FuVW50aWwgKHJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWlsLnNlYXJjaChyZSksIG1hdGNoO1xuXG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICAgIHRoaXMudGFpbCA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbWF0Y2ggPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBtYXRjaCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSByZW5kZXJpbmcgY29udGV4dCBieSB3cmFwcGluZyBhIHZpZXcgb2JqZWN0IGFuZFxuICAgKiBtYWludGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAqL1xuICBmdW5jdGlvbiBDb250ZXh0ICh2aWV3LCBwYXJlbnRDb250ZXh0KSB7XG4gICAgdGhpcy52aWV3ID0gdmlldztcbiAgICB0aGlzLmNhY2hlID0geyAnLic6IHRoaXMudmlldyB9O1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50Q29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbnRleHQgdXNpbmcgdGhlIGdpdmVuIHZpZXcgd2l0aCB0aGlzIGNvbnRleHRcbiAgICogYXMgdGhlIHBhcmVudC5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoICh2aWV3KSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGlzIGNvbnRleHQsIHRyYXZlcnNpbmdcbiAgICogdXAgdGhlIGNvbnRleHQgaGllcmFyY2h5IGlmIHRoZSB2YWx1ZSBpcyBhYnNlbnQgaW4gdGhpcyBjb250ZXh0J3Mgdmlldy5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIGxvb2t1cCAobmFtZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKGNhY2hlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIG5hbWVzLCBpbmRleCwgbG9va3VwSGl0ID0gZmFsc2U7XG5cbiAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlldztcbiAgICAgICAgICBuYW1lcyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBVc2luZyB0aGUgZG90IG5vdGlvbiBwYXRoIGluIGBuYW1lYCwgd2UgZGVzY2VuZCB0aHJvdWdoIHRoZVxuICAgICAgICAgICAqIG5lc3RlZCBvYmplY3RzLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogVG8gYmUgY2VydGFpbiB0aGF0IHRoZSBsb29rdXAgaGFzIGJlZW4gc3VjY2Vzc2Z1bCwgd2UgaGF2ZSB0b1xuICAgICAgICAgICAqIGNoZWNrIGlmIHRoZSBsYXN0IG9iamVjdCBpbiB0aGUgcGF0aCBhY3R1YWxseSBoYXMgdGhlIHByb3BlcnR5XG4gICAgICAgICAgICogd2UgYXJlIGxvb2tpbmcgZm9yLiBXZSBzdG9yZSB0aGUgcmVzdWx0IGluIGBsb29rdXBIaXRgLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogVGhpcyBpcyBzcGVjaWFsbHkgbmVjZXNzYXJ5IGZvciB3aGVuIHRoZSB2YWx1ZSBoYXMgYmVlbiBzZXQgdG9cbiAgICAgICAgICAgKiBgdW5kZWZpbmVkYCBhbmQgd2Ugd2FudCB0byBhdm9pZCBsb29raW5nIHVwIHBhcmVudCBjb250ZXh0cy5cbiAgICAgICAgICAgKiovXG4gICAgICAgICAgd2hpbGUgKHZhbHVlICE9IG51bGwgJiYgaW5kZXggPCBuYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gbmFtZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgbG9va3VwSGl0ID0gaGFzUHJvcGVydHkodmFsdWUsIG5hbWVzW2luZGV4XSk7XG5cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbbmFtZXNbaW5kZXgrK11dO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlld1tuYW1lXTtcbiAgICAgICAgICBsb29rdXBIaXQgPSBoYXNQcm9wZXJ0eShjb250ZXh0LnZpZXcsIG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvb2t1cEhpdClcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGNhY2hlW25hbWVdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKVxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKHRoaXMudmlldyk7XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgV3JpdGVyIGtub3dzIGhvdyB0byB0YWtlIGEgc3RyZWFtIG9mIHRva2VucyBhbmQgcmVuZGVyIHRoZW0gdG8gYVxuICAgKiBzdHJpbmcsIGdpdmVuIGEgY29udGV4dC4gSXQgYWxzbyBtYWludGFpbnMgYSBjYWNoZSBvZiB0ZW1wbGF0ZXMgdG9cbiAgICogYXZvaWQgdGhlIG5lZWQgdG8gcGFyc2UgdGhlIHNhbWUgdGVtcGxhdGUgdHdpY2UuXG4gICAqL1xuICBmdW5jdGlvbiBXcml0ZXIgKCkge1xuICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0ZW1wbGF0ZXMgaW4gdGhpcyB3cml0ZXIuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiBjbGVhckNhY2hlICgpIHtcbiAgICB0aGlzLmNhY2hlID0ge307XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiBgdGVtcGxhdGVgIGFuZCByZXR1cm5zIHRoZSBhcnJheSBvZiB0b2tlbnNcbiAgICogdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgcGFyc2UuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZTtcbiAgICB2YXIgdG9rZW5zID0gY2FjaGVbdGVtcGxhdGVdO1xuXG4gICAgaWYgKHRva2VucyA9PSBudWxsKVxuICAgICAgdG9rZW5zID0gY2FjaGVbdGVtcGxhdGVdID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncyk7XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIaWdoLWxldmVsIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gcmVuZGVyIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHdpdGhcbiAgICogdGhlIGdpdmVuIGB2aWV3YC5cbiAgICpcbiAgICogVGhlIG9wdGlvbmFsIGBwYXJ0aWFsc2AgYXJndW1lbnQgbWF5IGJlIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZVxuICAgKiBuYW1lcyBhbmQgdGVtcGxhdGVzIG9mIHBhcnRpYWxzIHRoYXQgYXJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlLiBJdCBtYXlcbiAgICogYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCB0byBsb2FkIHBhcnRpYWwgdGVtcGxhdGVzIG9uIHRoZSBmbHlcbiAgICogdGhhdCB0YWtlcyBhIHNpbmdsZSBhcmd1bWVudDogdGhlIG5hbWUgb2YgdGhlIHBhcnRpYWwuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgdmFyIHRva2VucyA9IHRoaXMucGFyc2UodGVtcGxhdGUpO1xuICAgIHZhciBjb250ZXh0ID0gKHZpZXcgaW5zdGFuY2VvZiBDb250ZXh0KSA/IHZpZXcgOiBuZXcgQ29udGV4dCh2aWV3KTtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgdGVtcGxhdGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb3ctbGV2ZWwgbWV0aG9kIHRoYXQgcmVuZGVycyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgdXNpbmdcbiAgICogdGhlIGdpdmVuIGBjb250ZXh0YCBhbmQgYHBhcnRpYWxzYC5cbiAgICpcbiAgICogTm90ZTogVGhlIGBvcmlnaW5hbFRlbXBsYXRlYCBpcyBvbmx5IGV2ZXIgdXNlZCB0byBleHRyYWN0IHRoZSBwb3J0aW9uXG4gICAqIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHdhcyBjb250YWluZWQgaW4gYSBoaWdoZXItb3JkZXIgc2VjdGlvbi5cbiAgICogSWYgdGhlIHRlbXBsYXRlIGRvZXNuJ3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucywgdGhpcyBhcmd1bWVudCBtYXlcbiAgICogYmUgb21pdHRlZC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyVG9rZW5zID0gZnVuY3Rpb24gcmVuZGVyVG9rZW5zICh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuXG4gICAgdmFyIHRva2VuLCBzeW1ib2wsIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICBzeW1ib2wgPSB0b2tlblswXTtcblxuICAgICAgaWYgKHN5bWJvbCA9PT0gJyMnKSB2YWx1ZSA9IHRoaXMucmVuZGVyU2VjdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnXicpIHZhbHVlID0gdGhpcy5yZW5kZXJJbnZlcnRlZCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnPicpIHZhbHVlID0gdGhpcy5yZW5kZXJQYXJ0aWFsKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICcmJykgdmFsdWUgPSB0aGlzLnVuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ25hbWUnKSB2YWx1ZSA9IHRoaXMuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ3RleHQnKSB2YWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW4pO1xuXG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXJTZWN0aW9uID0gZnVuY3Rpb24gcmVuZGVyU2VjdGlvbiAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBidWZmZXIgPSAnJztcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmVuZGVyIGFuIGFyYml0cmFyeSB0ZW1wbGF0ZVxuICAgIC8vIGluIHRoZSBjdXJyZW50IGNvbnRleHQgYnkgaGlnaGVyLW9yZGVyIHNlY3Rpb25zLlxuICAgIGZ1bmN0aW9uIHN1YlJlbmRlciAodGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBzZWxmLnJlbmRlcih0ZW1wbGF0ZSwgY29udGV4dCwgcGFydGlhbHMpO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHJldHVybjtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBqIDwgdmFsdWVMZW5ndGg7ICsraikge1xuICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZVtqXSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVGVtcGxhdGUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB1c2UgaGlnaGVyLW9yZGVyIHNlY3Rpb25zIHdpdGhvdXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlJyk7XG5cbiAgICAgIC8vIEV4dHJhY3QgdGhlIHBvcnRpb24gb2YgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHRoYXQgdGhlIHNlY3Rpb24gY29udGFpbnMuXG4gICAgICB2YWx1ZSA9IHZhbHVlLmNhbGwoY29udGV4dC52aWV3LCBvcmlnaW5hbFRlbXBsYXRlLnNsaWNlKHRva2VuWzNdLCB0b2tlbls1XSksIHN1YlJlbmRlcik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVySW52ZXJ0ZWQgPSBmdW5jdGlvbiByZW5kZXJJbnZlcnRlZCAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVXNlIEphdmFTY3JpcHQncyBkZWZpbml0aW9uIG9mIGZhbHN5LiBJbmNsdWRlIGVtcHR5IGFycmF5cy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4NlxuICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkpXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclBhcnRpYWwgPSBmdW5jdGlvbiByZW5kZXJQYXJ0aWFsICh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMpIHtcbiAgICBpZiAoIXBhcnRpYWxzKSByZXR1cm47XG5cbiAgICB2YXIgdmFsdWUgPSBpc0Z1bmN0aW9uKHBhcnRpYWxzKSA/IHBhcnRpYWxzKHRva2VuWzFdKSA6IHBhcnRpYWxzW3Rva2VuWzFdXTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0aGlzLnBhcnNlKHZhbHVlKSwgY29udGV4dCwgcGFydGlhbHMsIHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnVuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24gdW5lc2NhcGVkVmFsdWUgKHRva2VuLCBjb250ZXh0KSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24gZXNjYXBlZFZhbHVlICh0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiBtdXN0YWNoZS5lc2NhcGUodmFsdWUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmF3VmFsdWUgPSBmdW5jdGlvbiByYXdWYWx1ZSAodG9rZW4pIHtcbiAgICByZXR1cm4gdG9rZW5bMV07XG4gIH07XG5cbiAgbXVzdGFjaGUubmFtZSA9ICdtdXN0YWNoZS5qcyc7XG4gIG11c3RhY2hlLnZlcnNpb24gPSAnMi4yLjEnO1xuICBtdXN0YWNoZS50YWdzID0gWyAne3snLCAnfX0nIF07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiBjbGVhckNhY2hlICgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jbGVhckNhY2hlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpbiB0aGUgZGVmYXVsdCB3cml0ZXIgYW5kIHJldHVybnMgdGhlXG4gICAqIGFycmF5IG9mIHRva2VucyBpdCBjb250YWlucy4gRG9pbmcgdGhpcyBhaGVhZCBvZiB0aW1lIGF2b2lkcyB0aGUgbmVlZCB0b1xuICAgKiBwYXJzZSB0ZW1wbGF0ZXMgb24gdGhlIGZseSBhcyB0aGV5IGFyZSByZW5kZXJlZC5cbiAgICovXG4gIG11c3RhY2hlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCBhbmQgYHBhcnRpYWxzYCB1c2luZyB0aGVcbiAgICogZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHRlbXBsYXRlISBUZW1wbGF0ZSBzaG91bGQgYmUgYSBcInN0cmluZ1wiICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYnV0IFwiJyArIHR5cGVTdHIodGVtcGxhdGUpICsgJ1wiIHdhcyBnaXZlbiBhcyB0aGUgZmlyc3QgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdhcmd1bWVudCBmb3IgbXVzdGFjaGUjcmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyknKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5yZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGhlcmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggMC40LnguLFxuICAvKmVzbGludC1kaXNhYmxlICovIC8vIGVzbGludCB3YW50cyBjYW1lbCBjYXNlZCBmdW5jdGlvbiBuYW1lXG4gIG11c3RhY2hlLnRvX2h0bWwgPSBmdW5jdGlvbiB0b19odG1sICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHNlbmQpIHtcbiAgICAvKmVzbGludC1lbmFibGUqL1xuXG4gICAgdmFyIHJlc3VsdCA9IG11c3RhY2hlLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oc2VuZCkpIHtcbiAgICAgIHNlbmQocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBlc2NhcGluZyBmdW5jdGlvbiBzbyB0aGF0IHRoZSB1c2VyIG1heSBvdmVycmlkZSBpdC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8yNDRcbiAgbXVzdGFjaGUuZXNjYXBlID0gZXNjYXBlSHRtbDtcblxuICAvLyBFeHBvcnQgdGhlc2UgbWFpbmx5IGZvciB0ZXN0aW5nLCBidXQgYWxzbyBmb3IgYWR2YW5jZWQgdXNhZ2UuXG4gIG11c3RhY2hlLlNjYW5uZXIgPSBTY2FubmVyO1xuICBtdXN0YWNoZS5Db250ZXh0ID0gQ29udGV4dDtcbiAgbXVzdGFjaGUuV3JpdGVyID0gV3JpdGVyO1xuXG59KSk7XG4iXX0=
