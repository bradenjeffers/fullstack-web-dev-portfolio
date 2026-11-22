'use strict';

/**
 * Football Clubs browser.
 * Three views (list, club details, players) are rendered into #app from a small
 * piece of state, so "Back" restores the list AND the current search without
 * reloading the page.
 */

const app = document.getElementById('app');

const state = {
  view: 'list', // 'list' | 'details' | 'players'
  query: '',
  selectedClub: null,
};

/* ---------- tiny DOM helper ---------- */

/** Create an element; children may be strings (added as text) or nodes. Never parses HTML. */
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  const { dataset, ...rest } = props;
  Object.assign(node, rest);
  if (dataset) Object.assign(node.dataset, dataset);
  node.append(...children);
  return node;
}

function labelled(label, value) {
  return el('p', {}, el('b', {}, `${label}: `), value);
}

function clubImage(club, className) {
  const img = el('img', { src: club.image, alt: `${club.name} crest`, className, loading: 'lazy' });
  img.addEventListener('error', () => { img.hidden = true; }, { once: true });
  return img;
}

/* ---------- views ---------- */

function clubMatchesQuery(club, query) {
  const q = query.trim().toLowerCase();
  return !q || [club.name, club.city, club.league].some((field) => field.toLowerCase().includes(q));
}

function createClubCard(club) {
  const card = el('article', { className: 'club-card' });
  card.append(
    el('h2', {}, el('button', { type: 'button', className: 'card-link', dataset: { action: 'details', club: club.name } }, club.name)),
    clubImage(club),
    labelled('League', club.league),
    labelled('City', club.city),
    el('button', { type: 'button', dataset: { action: 'players', club: club.name } }, 'View Players')
  );
  return card;
}

function renderList() {
  const search = el('input', {
    type: 'search',
    id: 'search',
    placeholder: 'Search by club, city or league',
    value: state.query,
  });
  search.setAttribute('aria-label', 'Search football clubs');

  const results = el('div', { id: 'club-list', ariaLive: 'polite' });
  const draw = () => {
    const clubs = footballClubs.filter((club) => clubMatchesQuery(club, state.query));
    results.replaceChildren(
      ...(clubs.length ? clubs.map(createClubCard) : [el('p', { className: 'empty' }, 'No clubs match your search.')])
    );
  };

  // Re-render only the results so the input keeps focus while typing.
  search.addEventListener('input', () => {
    state.query = search.value;
    draw();
  });

  draw();
  app.replaceChildren(search, results);
}

function renderDetails(club) {
  app.replaceChildren(
    el('section', { className: 'detail' },
      el('h2', {}, club.name),
      clubImage(club, 'detail-image'),
      labelled('League', club.league),
      labelled('City', club.city),
      labelled('Stadium', club.stadium),
      labelled('Description', club.description),
      el('div', { className: 'detail-actions' },
        el('button', { type: 'button', dataset: { action: 'back' } }, 'Back'),
        el('button', { type: 'button', dataset: { action: 'players', club: club.name } }, 'View Players')
      )
    )
  );
}

function renderPlayers(club) {
  const cards = club.players.map((player) =>
    el('article', { className: 'player-card' },
      el('h3', {}, player.name),
      labelled('Position', player.position),
      labelled('Goals', String(player.goals)),
      labelled('Assists', String(player.assists))
    )
  );
  app.replaceChildren(
    el('section', { className: 'detail' },
      el('h2', {}, `Players of ${club.name}`),
      el('p', { className: 'note' }, 'Player statistics are sample data for this exercise.'),
      ...cards,
      el('div', { className: 'detail-actions' },
        el('button', { type: 'button', dataset: { action: 'back' } }, 'Back')
      )
    )
  );
}

function render() {
  const club = state.selectedClub;
  if (state.view === 'details' && club) renderDetails(club);
  else if (state.view === 'players' && club) renderPlayers(club);
  else renderList();
  window.scrollTo(0, 0);
}

/* ---------- events (one delegated listener for every button) ---------- */

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const { action, club: clubName } = target.dataset;
  if (clubName) state.selectedClub = footballClubs.find((c) => c.name === clubName) ?? null;

  if (action === 'back') {
    state.view = 'list';
    state.selectedClub = null;
  } else {
    state.view = action; // 'details' or 'players'
  }
  render();
});

render();
