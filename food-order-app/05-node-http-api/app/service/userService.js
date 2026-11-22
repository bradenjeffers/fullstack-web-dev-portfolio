const crypto = require("crypto");
const { loadJson } = require("./dataLoader");

// users.json holds DEMO credentials in plaintext, as the original assessment did.
// Never copy that pattern for real data: store a salted hash (scrypt/argon2/bcrypt).

const sha256 = (value) => crypto.createHash("sha256").update(value).digest();

// Hashing both sides gives equal-length buffers, which timingSafeEqual requires,
// and avoids leaking the password length through comparison time.
const passwordsMatch = (supplied, expected) =>
  crypto.timingSafeEqual(sha256(supplied), sha256(expected));

// Compared against when the username is unknown so both failure paths do the same work.
const DUMMY_PASSWORD = "not-a-real-password";

// Never expose the password field outside this module.
const toPublicUser = ({ password, ...user }) => user;

class Users {
  constructor() {
    this.users = loadJson("users.json");
  }

  getAllUsers() {
    return this.users.map(toPublicUser);
  }

  getUserByUsername(username) {
    const user = this.users.find((candidate) => candidate.username === username);
    return user ? toPublicUser(user) : undefined;
  }

  // Returns the public user on success, or null for any bad credentials.
  login(username, password) {
    const user = this.users.find((candidate) => candidate.username === username);
    const passwordOk = passwordsMatch(password, user ? user.password : DUMMY_PASSWORD);
    return user && passwordOk ? toPublicUser(user) : null;
  }
}

module.exports = new Users();
