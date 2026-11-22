'use strict';

/**
 * Page glue: wires the HTML pages to AuthCore (sign-in / register / logout) and Catalog (API data).
 * Each page sets <body data-page="...">.
 */

function getAuth() {
  try {
    return AuthCore.createAuthService({ store: localStorage, session: sessionStorage });
  } catch {
    return null; // storage blocked (e.g. some private-browsing modes)
  }
}

const auth = getAuth();
const page = document.body.dataset.page;

function showMessage(text, isError = true) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function setBusy(form, busy) {
  form.querySelectorAll('input, button').forEach((control) => { control.disabled = busy; });
}

/** Run an async form handler with the form disabled, surfacing unexpected errors as a message. */
async function handleSubmit(form, work) {
  setBusy(form, true);
  try {
    await work();
  } catch (err) {
    showMessage(err.message);
  } finally {
    setBusy(form, false);
  }
}

if (!auth) {
  if (page !== 'home') showMessage('Browser storage is unavailable, so sign-in cannot work here.');
}

/* ---------- register.html ---------- */
if (page === 'register' && auth) {
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(form, async () => {
      const result = await auth.register({
        fullname: form.fullname.value,
        username: form.username.value,
        email: form.email.value,
        contact: form.contact.value,
        password: form.password.value,
        confirmPassword: form['confirm-password'].value,
      });
      if (!result.ok) return showMessage(result.error);
      window.location.href = 'signin.html?registered=1';
    });
  });
}

/* ---------- signin.html ---------- */
if (page === 'signin' && auth) {
  if (new URLSearchParams(location.search).has('registered')) {
    showMessage('Account created. Please sign in.', false);
  }
  const form = document.getElementById('signinForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(form, async () => {
      const result = await auth.signIn(form.username.value, form.password.value);
      if (!result.ok) return showMessage(result.error);
      window.location.href = 'index.html';
    });
  });
}

/* ---------- index.html ---------- */
if (page === 'home') {
  if (!auth || !auth.isLoggedIn()) {
    window.location.replace('signin.html'); // replace: Back won't loop to the protected page
  } else {
    document.getElementById('welcome').textContent = `Signed in as ${auth.currentUser()}`;
    document.getElementById('logout-button').addEventListener('click', () => {
      auth.logout();
      window.location.href = 'signin.html';
    });

    const base = window.APP_CONFIG.API_BASE_URL.replace(/\/+$/, '');
    Catalog.loadInto(document.getElementById('cuisine-list'), `${base}/cuisines`);
    Catalog.loadInto(document.getElementById('category-list'), `${base}/categories`);
    Catalog.loadInto(document.getElementById('restaurant-list'), `${base}/restaurants`);
  }
}
