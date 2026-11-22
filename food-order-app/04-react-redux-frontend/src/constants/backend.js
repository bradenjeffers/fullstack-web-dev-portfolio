// The API location is configured at build time (see .env.example); CRA only
// exposes variables that start with REACT_APP_.
const DEFAULT_BASE_URL = "http://localhost:8080/v1/";

const withTrailingSlash = (url) => (url.endsWith("/") ? url : `${url}/`);

export const API_BASE_URL = withTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL
);

// Path of the login endpoint, relative to the base URL. The Express/MongoDB
// API (06) serves it at "users/login"; the plain-Node API (05) at "login".
export const LOGIN_PATH = process.env.REACT_APP_LOGIN_PATH || "login";

export const ENDPOINTS = {
  login: LOGIN_PATH,
  restaurants: "restaurants",
  categories: "categories",
  cuisines: "cuisines",
};
