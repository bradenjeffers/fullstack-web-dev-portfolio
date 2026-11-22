const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDatabase = require("./app/database/databaseInit");
const { SERVER_PORT } = require("./app/constants");
const { notFound, errorHandler } = require("./app/middleware/errorHandlers");

const categoryRouter = require("./app/routes/categoryRoutes");
const userRouter = require("./app/routes/userRoutes");
const cuisineRouter = require("./app/routes/cuisineRoutes");
const fooditemRouter = require("./app/routes/fooditemRoutes");
const restaurantRouter = require("./app/routes/restaurantRoutes");
const menuRouter = require("./app/routes/menuRoutes");
const orderRouter = require("./app/routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true, parameterLimit: 50000 }));

app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cuisines", cuisineRouter);
app.use("/api/v1/fooditems", fooditemRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/menus", menuRouter);
app.use("/api/v1/orders", orderRouter);

// Liveness only: answers even when the database is down (kept for compatibility).
app.get("/PING", (_, res) => {
  res.status(200).json({ message: "PONG" });
});

// Readiness: 503 until the database connection is up.
app.get("/health", (_, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    database: dbConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Error handling must come after every route, otherwise it never sees their errors.
app.use(notFound);
app.use(errorHandler);

let server = null;
let starting = null;

// Connects to MongoDB and starts listening. Safe to call more than once: it
// returns the already-running server instead of listening twice.
const start = () => {
  if (server) return Promise.resolve(server);
  if (starting) return starting;

  starting = (async () => {
    await connectDatabase();
    const listening = await new Promise((resolve, reject) => {
      const instance = app.listen(SERVER_PORT, () => resolve(instance));
      instance.once("error", reject);
    });
    server = listening;
    console.log(`Server is running at port : ${server.address().port}`);
    return server;
  })();

  // Allow a retry if startup failed.
  starting.catch(() => {
    starting = null;
  });
  return starting;
};

// Stops accepting requests, drops open keep-alive connections, then closes the
// MongoDB connection so the process (or a test run) can exit cleanly.
const stop = async () => {
  if (starting) {
    await starting.catch(() => {});
  }
  if (server) {
    const closing = server;
    server = null;
    const closed = new Promise((resolve, reject) =>
      closing.close((err) => (err ? reject(err) : resolve()))
    );
    // close() alone waits for idle keep-alive sockets; end them (Node 18.2+).
    if (closing.closeAllConnections) closing.closeAllConnections();
    await closed;
  }
  starting = null;
  await mongoose.disconnect();
};

module.exports = { app, start, stop };

if (require.main === module) {
  start().catch((err) => {
    console.error(`Failed to start: ${err.message}`);
    process.exit(1);
  });

  const shutdown = () => stop().then(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
