# Readme

This is a standalone library for a portable player for Music Dealers.

## Features
  - Looks for location for a player to be inserted.
  - Inserts player into container
  - Requires song id
  - Support custom templates

## Usage

Assumes it's loaded after the HTML is rendered.

### External Dependencies
  - API call

### Implementation

#### Include players inline in-page

  - The `song-id` or `playlist-id` data attribute is required on the container for the player.

``` html
<div class="md-player" data-song-id="9292839"></div>

<div class="md-player" data-playlist-id="9292839"></div>
```

Optional data attributes
  - `template-id` - override default template

#### Include a template

Ensure the following classes exist
  - `md-play` - play button (and pause if no `md-pause`)

Optional classes
  - `player-progress` - progress bar container
  - `loaded-container` - displays time elapsed
  - `played-container` - displays total time of track

Use the following data values
  - _see pie_

``` html
<script type="text/template" id="player-template">
  <div class="md-player-body">
    <h2><strong>[[ title ]]</strong> <small>by</small> [[ artist.name ]] <small><span class="elapsed">[[ elapsed ]]</span> - [[ duration_formatted ]]</small></h2>
    <img class="img-responsive" src="[[artist.profile_pic_90_url]]">
    <div class="audio-player">
      <div class="player-progress" style="background-image: url(http://mdlrs.com/createwaveform/[[ id ]])">
        <div class="loaded-container"></div>
        <div class="played-container"></div>
      </div>
      <button class="md-play">Play</button>
    </div>
  </div>
</script>
```

#### Include the JS file _(after JQuery and player HTML)_

``` html
<script src="md-player.js"></script>
<script>
  mdPlayer();
</script>
```

#### Include styles _(see md-player.css for base styles)_

## Builds

Always do an updated min build for production

Based on: _http://makerlog.org/posts/creating-js-library-builds-with-browserify-and-other-npm-modules_

- run npm install
- insure browserify, uglifyjs, deamdify, and watchify are installed globally
- run `npm run watch` for active development
- run `npm run build-debug` for dev (debug) build
- run `npm run build-min` for minify (production) build
- run `npm run build` for debug and production build
