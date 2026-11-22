'use strict';

/**
 * Video player with a playlist, search and shuffle.
 *
 * State is kept in one place:
 *   - order:     the playlist in play order (original order, or shuffled copy)
 *   - currentId: the id of the video that is loaded (ids are stable, unlike array
 *                indexes, so searching/shuffling can't make the wrong video play)
 *   - query:     the search text; it only filters what is LISTED, not the play order
 */

const video = document.getElementById('video');
const listEl = document.getElementById('video-list');
const searchInput = document.getElementById('search-input');
const titleEl = document.getElementById('video-title');
const artistEl = document.getElementById('video-artist');
const playButton = document.getElementById('play-button');
const shuffleButton = document.getElementById('shuffle-button');
const errorEl = document.getElementById('player-error');

const originalOrder = [...videos];
let order = [...originalOrder];
let currentId = order[0]?.id ?? null;
let query = '';

const currentVideo = () => order.find((v) => v.id === currentId);

/** Fisher-Yates shuffle that returns a new array and leaves the input alone. */
function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------- rendering ---------- */

function renderPlaylist() {
  const q = query.trim().toLowerCase();
  const visible = order.filter((v) => v.title.toLowerCase().includes(q));

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No videos match your search.';
    listEl.replaceChildren(empty);
    return;
  }

  listEl.replaceChildren(
    ...visible.map((v) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.id = String(v.id);
      button.textContent = `${v.title} - ${v.artist}`;
      if (v.id === currentId) button.setAttribute('aria-current', 'true');
      li.append(button);
      return li;
    })
  );
}

function renderNowPlaying() {
  const v = currentVideo();
  titleEl.textContent = v ? v.title : 'No video selected';
  artistEl.textContent = v ? v.artist : '';
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

/* ---------- playback ---------- */

/** Load a video by id and (optionally) start playing it. */
function loadVideo(id, { autoplay = true } = {}) {
  currentId = id;
  const v = currentVideo();
  if (!v) return;

  showError('');
  video.src = v.url;
  renderNowPlaying();
  renderPlaylist();

  if (autoplay) {
    // play() returns a promise that rejects if the browser blocks autoplay.
    video.play().catch(() => { /* user can press play; no need to surface this */ });
  }
}

function step(delta) {
  if (order.length === 0) return;
  const index = order.findIndex((v) => v.id === currentId);
  loadVideo(order[(index + delta + order.length) % order.length].id);
}

/* ---------- events ---------- */

playButton.addEventListener('click', () => {
  if (!video.getAttribute('src')) {
    loadVideo(currentId);
  } else if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
});

video.addEventListener('play', () => { playButton.textContent = 'Pause'; });
video.addEventListener('pause', () => { playButton.textContent = 'Play'; });
video.addEventListener('ended', () => step(1));
video.addEventListener('error', () => {
  const v = currentVideo();
  showError(`Could not load "${v ? v.title : 'video'}". Check that the file exists in the videos folder.`);
});

document.getElementById('next-button').addEventListener('click', () => step(1));
document.getElementById('prev-button').addEventListener('click', () => step(-1));

shuffleButton.addEventListener('click', () => {
  const on = shuffleButton.getAttribute('aria-pressed') !== 'true';
  shuffleButton.setAttribute('aria-pressed', String(on));
  shuffleButton.textContent = on ? 'Unshuffle' : 'Shuffle';
  order = on ? shuffled(originalOrder) : [...originalOrder];
  renderPlaylist(); // the current video keeps playing; only the upcoming order changes
});

// Event delegation: one listener handles every playlist entry, including re-rendered ones.
listEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (button) loadVideo(Number(button.dataset.id));
});

searchInput.addEventListener('input', () => {
  query = searchInput.value;
  renderPlaylist();
});

/* ---------- init ---------- */

if (currentId !== null) video.src = currentVideo().url; // preload metadata, don't autoplay
renderNowPlaying();
renderPlaylist();
