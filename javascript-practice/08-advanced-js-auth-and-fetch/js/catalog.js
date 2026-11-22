/**
 * Loads cuisines, categories and restaurants from the Food Order API and renders them as cards.
 * Each section loads independently, so one failing endpoint doesn't blank the whole page.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const REQUEST_TIMEOUT_MS = 10000;

  /** GET JSON with a timeout. Throws a readable Error on network, HTTP or parse failure. */
  async function fetchList(url, fetchImpl = fetch) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`.trim());
      return normaliseList(await response.json());
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('The request timed out.');
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /** Accepts either a bare array or a {data: [...]} envelope. */
  function normaliseList(body) {
    const list = Array.isArray(body) ? body : body && body.data;
    if (!Array.isArray(list)) throw new Error('Unexpected response format (expected a list).');
    return list;
  }

  /* ---------- DOM rendering (browser only) ---------- */

  function createCard(item) {
    const card = document.createElement('article');
    card.className = 'card';

    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';           // decorative: the name is right below it
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.hidden = true; }, { once: true });
      card.append(img);
    }

    const name = document.createElement('h4');
    name.textContent = item.name ?? 'Unnamed';
    card.append(name);
    return card;
  }

  function renderItems(container, items) {
    if (items.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'Nothing to show yet.';
      container.replaceChildren(p);
      return;
    }
    container.replaceChildren(...items.map(createCard));
  }

  function renderError(container, message, onRetry) {
    const p = document.createElement('p');
    p.className = 'error';
    p.textContent = `Unable to load data. ${message}`;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Retry';
    retry.addEventListener('click', onRetry);
    container.replaceChildren(p, retry);
  }

  /** Fetch one endpoint and render it into `container`, with loading and error states. */
  async function loadInto(container, url) {
    container.setAttribute('aria-busy', 'true');
    const loading = document.createElement('p');
    loading.textContent = 'Loading...';
    container.replaceChildren(loading);

    try {
      renderItems(container, await fetchList(url));
    } catch (err) {
      renderError(container, err.message, () => loadInto(container, url));
    } finally {
      container.removeAttribute('aria-busy');
    }
  }

  return { fetchList, normaliseList, loadInto };
});
