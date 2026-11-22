// Thin wrapper around sessionStorage so the app keeps working when storage is
// unavailable (private mode, blocked cookies) or holds corrupt data.
const KEY = "loggedInUser";

export const loadSession = () => {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSession = (user) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // Not persisted: the user simply has to log in again after a refresh.
  }
};

export const clearSession = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
};
