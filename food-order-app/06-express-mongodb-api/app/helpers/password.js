const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../constants');

const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
