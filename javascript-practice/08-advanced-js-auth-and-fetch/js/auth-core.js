/**
 * Client-side registration / sign-in logic, kept free of DOM code so it can run
 * in the browser AND be unit-tested in Node (UMD-style export at the bottom).
 *
 * IMPORTANT: this is a learning exercise. Anything stored in the browser can be
 * read or edited by whoever uses that browser, so this is NOT real security.
 * Real authentication needs a server (see ../../food-order-app/06-express-mongodb-api).
 * What it does do properly: passwords are never stored in plain text. They are
 * salted and run through PBKDF2 (SHA-256) before being saved.
 */
(function (root, factory) {
  const api = factory(root.crypto);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AuthCore = api;
})(typeof self !== 'undefined' ? self : globalThis, function (cryptoApi) {
  'use strict';

  const USERS_KEY = 'foodorder.users';
  const SESSION_KEY = 'foodorder.session';
  const PBKDF2_ITERATIONS = 100000;

  /* ---------- password hashing ---------- */

  const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
  const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

  async function hashPassword(password, saltBase64) {
    if (!cryptoApi || !cryptoApi.subtle) {
      throw new Error('Secure hashing is unavailable. Open this page over https:// or http://localhost.');
    }
    const salt = saltBase64 ? fromBase64(saltBase64) : cryptoApi.getRandomValues(new Uint8Array(16));
    const key = await cryptoApi.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await cryptoApi.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
      key,
      256
    );
    return { salt: toBase64(salt), hash: toBase64(new Uint8Array(bits)) };
  }

  /** Compares two strings without bailing out at the first difference. */
  function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* ---------- validation ---------- */

  /** Returns an error message, or null when the registration data is valid. */
  function validateRegistration({ fullname, username, email, contact, password, confirmPassword }) {
    if (![fullname, username, email, contact, password, confirmPassword].every((v) => typeof v === 'string' && v.trim())) {
      return 'Please fill in every field.';
    }
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username.trim())) {
      return 'Username must be 3-30 characters: letters, numbers, dot, dash or underscore.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (!/^\+?[0-9 ()-]{7,20}$/.test(contact.trim())) return 'Please enter a valid phone number.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  /* ---------- service ---------- */

  /**
   * @param {{store: Storage, session: Storage}} storages
   *   store   - persistent (localStorage) for registered users
   *   session - per-tab (sessionStorage) for the signed-in username
   */
  function createAuthService({ store, session }) {
    function readUsers() {
      try {
        const parsed = JSON.parse(store.getItem(USERS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return []; // corrupt data: behave as if no users exist
      }
    }
    const findUser = (users, username) =>
      users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    return {
      async register(data) {
        const problem = validateRegistration(data);
        if (problem) return { ok: false, error: problem };

        const users = readUsers();
        if (findUser(users, data.username)) return { ok: false, error: 'That username is already taken.' };

        const { salt, hash } = await hashPassword(data.password);
        users.push({
          fullname: data.fullname.trim(),
          username: data.username.trim(),
          email: data.email.trim(),
          contact: data.contact.trim(),
          salt,
          hash,
        });
        store.setItem(USERS_KEY, JSON.stringify(users));
        return { ok: true };
      },

      async signIn(username, password) {
        // One generic message for "no such user" and "wrong password" so the form doesn't reveal which usernames exist.
        const fail = { ok: false, error: 'Invalid username or password.' };
        if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) return fail;

        const user = findUser(readUsers(), username);
        if (!user) return fail;

        const { hash } = await hashPassword(password, user.salt);
        if (!safeEqual(hash, user.hash)) return fail;

        session.setItem(SESSION_KEY, user.username);
        return { ok: true, username: user.username };
      },

      currentUser() {
        return session.getItem(SESSION_KEY);
      },

      isLoggedIn() {
        return Boolean(session.getItem(SESSION_KEY));
      },

      logout() {
        session.removeItem(SESSION_KEY);
      },
    };
  }

  return { createAuthService, validateRegistration, hashPassword, USERS_KEY, SESSION_KEY };
});
