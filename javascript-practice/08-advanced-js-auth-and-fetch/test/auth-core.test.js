'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAuthService, validateRegistration, USERS_KEY } = require('../js/auth-core');
const { fetchList, normaliseList } = require('../js/catalog');

/** Minimal in-memory stand-in for localStorage / sessionStorage. */
class MemoryStorage {
  #data = new Map();
  getItem(k) { return this.#data.has(k) ? this.#data.get(k) : null; }
  setItem(k, v) { this.#data.set(k, String(v)); }
  removeItem(k) { this.#data.delete(k); }
}

const valid = {
  fullname: 'Ada Lovelace', username: 'ada', email: 'ada@example.com',
  contact: '+1 555 0100', password: 'correct-horse', confirmPassword: 'correct-horse',
};
const newAuth = () => {
  const store = new MemoryStorage();
  return { store, session: new MemoryStorage(), auth: null, make() { this.auth = createAuthService(this); return this.auth; } };
};

test('validateRegistration', () => {
  assert.equal(validateRegistration(valid), null);
  assert.match(validateRegistration({ ...valid, fullname: ' ' }), /every field/);
  assert.match(validateRegistration({ ...valid, username: 'a b' }), /Username/);
  assert.match(validateRegistration({ ...valid, email: 'nope' }), /email/);
  assert.match(validateRegistration({ ...valid, contact: 'abc' }), /phone/);
  assert.match(validateRegistration({ ...valid, password: 'short', confirmPassword: 'short' }), /8 characters/);
  assert.match(validateRegistration({ ...valid, confirmPassword: 'different' }), /do not match/);
});

test('register, then sign in; password is never stored in plain text', async () => {
  const ctx = newAuth(); const auth = ctx.make();
  assert.deepEqual(await auth.register(valid), { ok: true });

  const stored = ctx.store.getItem(USERS_KEY);
  assert.ok(!stored.includes('correct-horse'), 'plain-text password must not be stored');
  const [user] = JSON.parse(stored);
  assert.ok(user.salt && user.hash);
  assert.equal(user.password, undefined);

  assert.equal(auth.isLoggedIn(), false);
  assert.deepEqual(await auth.signIn('ada', 'correct-horse'), { ok: true, username: 'ada' });
  assert.equal(auth.isLoggedIn(), true);
  assert.equal(auth.currentUser(), 'ada');
  auth.logout();
  assert.equal(auth.isLoggedIn(), false);
});

test('wrong password and unknown user give the same generic error', async () => {
  const ctx = newAuth(); const auth = ctx.make();
  await auth.register(valid);
  const wrongPw = await auth.signIn('ada', 'wrong-password');
  const noUser = await auth.signIn('nobody', 'whatever1');
  assert.deepEqual(wrongPw, { ok: false, error: 'Invalid username or password.' });
  assert.deepEqual(noUser, wrongPw);
  assert.equal(auth.isLoggedIn(), false);
});

test('usernames are unique, case-insensitively', async () => {
  const ctx = newAuth(); const auth = ctx.make();
  await auth.register(valid);
  const again = await auth.register({ ...valid, username: 'ADA' });
  assert.equal(again.ok, false);
  assert.match(again.error, /already taken/);
});

test('"__proto__" style usernames are handled safely', async () => {
  const ctx = newAuth(); const auth = ctx.make();
  const res = await auth.register({ ...valid, username: '__proto__' });
  assert.equal(res.ok, true);
  assert.equal((await auth.signIn('__proto__', 'correct-horse')).ok, true);
  assert.equal(({}).fullname, undefined);
});

test('corrupt stored data is treated as "no users"', async () => {
  const ctx = newAuth(); ctx.store.setItem(USERS_KEY, '{not json'); const auth = ctx.make();
  assert.equal((await auth.signIn('ada', 'correct-horse')).ok, false);
  assert.equal((await auth.register(valid)).ok, true);
});

test('normaliseList accepts arrays and {data: []} envelopes, rejects anything else', () => {
  assert.deepEqual(normaliseList([1]), [1]);
  assert.deepEqual(normaliseList({ data: [2] }), [2]);
  assert.throws(() => normaliseList({ nope: true }), /Unexpected response/);
  assert.throws(() => normaliseList(null), /Unexpected response/);
});

test('fetchList surfaces HTTP errors and parses success', async () => {
  const ok = async () => ({ ok: true, json: async () => [{ name: 'Italian' }] });
  assert.deepEqual(await fetchList('http://x/v1/cuisines', ok), [{ name: 'Italian' }]);
  const bad = async () => ({ ok: false, status: 500, statusText: 'Server Error' });
  await assert.rejects(fetchList('http://x', bad), /500/);
});
