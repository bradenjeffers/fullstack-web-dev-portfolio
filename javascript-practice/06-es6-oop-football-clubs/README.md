# Football Clubs Database

Browse football clubs, search by club, city or league, and drill into club details and players.

## Overview

Originally "JavaScript ES6 and OOP, Part 2" from a Great Learning full-stack course. The assessment asked for four features (club click handler, details view, players view, search). This version keeps those features and restructures how they're rendered.

## Features

- Grid of 19 clubs with live search (name, city or league)
- Club details view and a players view
- "Back" returns to the list **with the search text and results intact**

## Getting started

Open `index.html` in a browser (or `python3 -m http.server 8000` in this folder).

## Project structure

```
index.html
style.css
football-clubs.js   data
script.js           views, state and event handling
```

## What I practised

- Higher-order array methods (`filter`, `map`, `find`, `some`)
- A small state object driving which view is shown
- Event delegation: one click listener for every button
- Building DOM with a tiny `el()` helper instead of string templates

## Improvements over the original assessment version

- **Safer and sturdier rendering:** the original interpolated club names into `innerHTML` and into inline `onclick="viewClubPlayers('${club.name}')"` attributes, which breaks on a name containing an apostrophe and allows script injection. Elements are now created with DOM APIs and located by `data-` attributes.
- **No page reloads:** "Back" used `window.location.reload()`, which threw away the search. Views are re-rendered from state instead.
- **Search keeps focus** while typing (only the results re-render), and shows a message when nothing matches.
- **Accessibility:** the club name is a real button, the search has a label, visible focus rings, and `prefers-reduced-motion` is respected.
- Fixed a typo in the data ("Vinicious Junior" is now "Vinícius Júnior") and normalised inconsistent formatting.

## Data caveat

Club details (league, city, stadium) are real, but **the player statistics are placeholder values from the course template**: several clubs repeat the same numbers (for example 10 goals / 3 assists, 12 / 4, and 227 / 122), and some positions don't match the real players. The players view says so on screen. Replace the data before using this for anything real.

Club crests are loaded from Wikimedia Commons; the app hides an image that fails to load.

## Status

Checked in headless Chromium (Playwright): 19 cards render; search filters (for example "la liga" returns 4) and keeps input focus; the empty state; details, players and Back with the search preserved; no console errors. There are no automated tests in the repo.
