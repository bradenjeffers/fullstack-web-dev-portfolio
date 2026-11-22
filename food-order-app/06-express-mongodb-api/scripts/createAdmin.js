// Creates (or promotes) an admin account without opening up public admin sign-up.
//   ADMIN_USERNAME=admin ADMIN_PASSWORD='a-long-password' ADMIN_EMAIL=me@example.com npm run create-admin
const connectDatabase = require("../app/database/databaseInit");
const userRepository = require("../app/database/repositories/userRepository");
const { hashPassword } = require("../app/helpers/password");
const mongoose = require("mongoose");

const MIN_PASSWORD_LENGTH = 8;

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_FULLNAME } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_EMAIL) {
    throw new Error("Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_EMAIL (see .env.example).");
  }
  if (ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  await connectDatabase();
  const password = await hashPassword(ADMIN_PASSWORD);
  const existing = await userRepository.findUserByUsername(ADMIN_USERNAME);

  if (existing) {
    await userRepository.updateUser(existing._id, { password, isAdmin: true });
    console.log(`Updated existing user "${ADMIN_USERNAME}": now an admin with the new password.`);
  } else {
    await userRepository.createUser({
      username: ADMIN_USERNAME,
      fullname: ADMIN_FULLNAME || "Administrator",
      email: ADMIN_EMAIL,
      password,
      isAdmin: true,
    });
    console.log(`Created admin user "${ADMIN_USERNAME}".`);
  }
}

main()
  .catch((err) => {
    console.error(`create-admin failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
