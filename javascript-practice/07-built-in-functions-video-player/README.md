# Video Player with Playlist, Search and Shuffle

A browser video player that uses built-in JavaScript functions and browser APIs: array methods, `Math.random`, the `<video>` element API, and DOM events.

## Overview

Originally the "Built-in Functions in JavaScript" assessment from a Great Learning full-stack course (a "music player" that plays video clips). This version fixes several real bugs in how the playlist, search and shuffle interact.

## Features

- Play / Pause, Previous, Next (wraps around) and automatic advance when a video ends
- Search the playlist by title
- Shuffle / Unshuffle (Fisher-Yates)
- The current video is highlighted in the list (`aria-current`)
- A visible error message if a video file can't be loaded

## Getting started

Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000`.

### Using your own videos

The folder includes four tiny (about 180 KB total) synthetic test clips, generated with ffmpeg, so the player works out of the box. To use your own, put `.mp4` files in `videos/` and edit `videos.js`. The original assessment's four sample videos (about 95 MB) were intentionally **not** included: they are too large for a normal Git repository and I could not confirm their licence.

## Project structure

```
index.html
style.css
videos.js          playlist data
script.js          player, playlist, search, shuffle
videos/demo-*.mp4  synthetic test clips
```

## What I practised

- Built-in array functions: `filter`, `map`, `find`, `findIndex`, spread copies
- The `HTMLMediaElement` API (`play()` returns a promise, `pause`, `ended` and `error` events)
- Event delegation and keeping one source of truth for state
- Fisher-Yates shuffle on a copy rather than the original array

## Improvements over the original assessment version

- **Search bug:** after filtering the playlist, clicking an item played the video at that *position in the full list*, not the one you clicked. Items now carry stable ids.
- **Shuffle:** the original shuffled the global `videos` array in place and kept juggling two lists (`isShuffle ? videos : originalList`) throughout the code. There is now one `order` array built from a copy, and the current video keeps playing when you toggle shuffle.
- **Play button** now toggles play/pause and its label follows the real player state; before it always restarted the video.
- **Unhandled promise:** `video.play()` rejections (for example blocked autoplay) are handled.
- **Missing files** show an error instead of failing silently.
- Accessibility: playlist entries are real `<button>`s, a label for the search box, `aria-pressed` on Shuffle, visible focus, reduced-motion support.

## Limitations

No volume/seek UI beyond the browser's native controls, and playlist order is not remembered between visits.

## Status

Checked in headless Chromium (Playwright): next/previous wrap, the search-then-click regression, shuffle/unshuffle, empty-search message, the load-error message, and real playback of a demo clip (the time advanced and the button changed to "Pause"). There are no automated tests in the repo.
