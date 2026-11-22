// Copies only the listed keys that are actually present (not undefined), so a
// partial update never overwrites a field with `undefined`.
const pickDefined = (source, keys) =>
  keys.reduce((picked, key) => {
    if (source && source[key] !== undefined) {
      picked[key] = source[key];
    }
    return picked;
  }, {});

module.exports = { pickDefined };
