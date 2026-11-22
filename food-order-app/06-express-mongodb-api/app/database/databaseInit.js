const mongoose = require('mongoose');
const { DATABASE_URI } = require('../constants');

mongoose.set('strictQuery', true);

// Connects once; calling it again while connected is a no-op. Errors are thrown
// to the caller (never process.exit here) and the connection string is never
// logged because it may contain credentials.
const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(DATABASE_URI, { serverSelectionTimeoutMS: 5000 });
  const { host, port, name } = mongoose.connection;
  console.log(`Database connected: ${name} on ${host}:${port}`);
  return mongoose.connection;
};

module.exports = connectDatabase;
