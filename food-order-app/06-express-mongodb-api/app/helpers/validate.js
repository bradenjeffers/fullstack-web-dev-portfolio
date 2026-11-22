const HttpError = require('./httpError');

// Throws a 400 listing every required field that is missing or blank.
// `false` and `0` count as present (e.g. isVeg: false).
const requireFields = (body, fields) => {
  const source = body || {};
  const missing = fields.filter(
    (field) => source[field] === undefined || source[field] === null || source[field] === ''
  );
  if (missing.length) {
    throw new HttpError(400, `Missing required fields: ${missing.join(', ')}`);
  }
};

// Query-string values can arrive as arrays/objects (?a[$ne]=x); only plain strings
// may be used in database filters.
const requireString = (value, label) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${label} must be a non-empty string`);
  }
  return value;
};

module.exports = { requireFields, requireString };
