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
css_tag.setAttribute("href", "dist/md-player.css");
(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(css_tag);

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// check if i have attributes on me.
// if so, create a md-player div for me with my attributes.
var pageScripts = document.scripts;
var myScript = document.scripts[document.scripts.length-1];
if (c$(myScript).attr('data-playlist-id') || c$(myScript).attr('data-song-id')) {
  var myDiv = '<div class="md-player" data-playlist-id="'+c$(myScript).attr('data-playlist-id')+'" data-song-id="'+c$(myScript).attr('data-song-id')+'" data-template-id="'+c$(myScript).attr('data-template-id')+'"></div>';
  document.write(myDiv);
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
      {},
      function(err, resp) {
        if (!resp) return;
        // get element data
        var data = {};
        data.song = resp;
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
        }

        // this gets the wrong number occassionally (to fast to load?) and ends up really wide
        var waveformWidth = c$(el).eq(0).find('.waveform-container').width();

        var q = {
          color: {
            fg: "BE3026",
            bg: ""
          },
          bar_width: 2,
          bar_gap: 1,
          filename: "waveform.json",
          vertical_align: false,
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
          {},
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
      {},
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
        });

        // attach events
        // these need to be element specific to avoid multiple binds on an element
        c$(el).on('click', '.md-play', function() {
          var $prev_player = $current_player;
          $current_player = c$(this).closest('.md-player');
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
        });

        // set to true to avoid re-initializing an existing player if js included multiple times
        c$(el).attr('data-init', true);

      };

  });

});
