const http = require("http");

const { HttpError, sendJson } = require("./app/http");
const categoryHandlers = require("./app/handlers/categoryHandlers");
const cuisineHandlers = require("./app/handlers/cuisineHandlers");
const restaurantHandlers = require("./app/handlers/restaurantHandlers");
const fooditemHandlers = require("./app/handlers/fooditemHandlers");
const menuHandlers = require("./app/handlers/menuHandlers");
const menuitemHandlers = require("./app/handlers/menuitemHandlers");
const userHandlers = require("./app/handlers/userHandlers");

const DEFAULT_PORT = 8080;
// The React client in ../04-react-redux-frontend runs on the CRA dev server.
const DEFAULT_CORS_ORIGIN = "http://localhost:3000";

// Shared by every "GET collection, or GET one by ?id=" endpoint.
function listOrById(query, fetchAll, fetchById) {
  return (req, res) => {
    if (query.id === undefined) return fetchAll(req, res);
    if (query.id === "") throw new HttpError(400, "id must not be empty");
    return fetchById(req, res, query.id);
  };
}

// Route table: path -> HTTP method -> (req, res, query) => void | Promise<void>.
// Anything that throws an HttpError is turned into a JSON error response by the server.
const routes = {
  "/v1/categories": {
    GET: (req, res, query) =>
      listOrById(
        query,
        categoryHandlers.fetchAllCategoriesHandler,
        categoryHandlers.fetchCategoryByIdHandler
      )(req, res),
  },
  "/v1/cuisines": {
    GET: (req, res, query) =>
      listOrById(
        query,
        cuisineHandlers.fetchAllCuisinesHandler,
        cuisineHandlers.fetchCuisineByIdHandler
      )(req, res),
  },
  "/v1/restaurants": {
    GET: (req, res, query) => {
      if (query.id !== undefined) {
        return listOrById(query, null, restaurantHandlers.fetchRestaurantByIdHandler)(req, res);
      }
      if (query.cuisine !== undefined || query.category !== undefined) {
        return restaurantHandlers.fetchRestaurantsByFilterHandler(req, res, query);
      }
      return restaurantHandlers.fetchAllRestaurantsHandler(req, res);
    },
  },
  "/v1/fooditems": {
    GET: (req, res, query) =>
      listOrById(
        query,
        fooditemHandlers.fetchAllFooditemsHandler,
        fooditemHandlers.fetchFooditemByIdHandler
      )(req, res),
  },
  "/v1/menus": {
    GET: (req, res, query) =>
      listOrById(query, menuHandlers.fetchAllMenusHandler, menuHandlers.fetchMenuByIdHandler)(
        req,
        res
      ),
  },
  "/v1/menuitems": {
    GET: (req, res, query) => {
      if (query.id !== undefined) {
        return listOrById(query, null, menuitemHandlers.fetchMenuitemByIdHandler)(req, res);
      }
      if (query.restaurantId !== undefined) {
        return menuitemHandlers.fetchMenuitemByRestaurantIdHandler(req, res, query);
      }
      if (query.categoryId !== undefined || query.cuisineId !== undefined) {
        throw new HttpError(400, "categoryId and cuisineId require restaurantId");
      }
      return menuitemHandlers.fetchAllMenuitemsHandler(req, res);
    },
  },
  "/v1/users": {
    GET: (req, res, query) => {
      if (query.username === undefined) return userHandlers.fetchAllUsersHandler(req, res);
      return userHandlers.fetchUserByUsernameHandler(req, res, query.username);
    },
  },
  "/v1/login": {
    POST: (req, res) => userHandlers.loginHandler(req, res),
  },
};

function parseRequestUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl, "http://localhost");
  } catch {
    throw new HttpError(400, "Malformed URL");
  }
  // A trailing slash is treated the same as none (but "/" stays "/").
  const pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : parsed.pathname;
  // First value wins for repeated params.
  const query = {};
  for (const [key, value] of parsed.searchParams) {
    if (!(key in query)) query[key] = value;
  }
  return { pathname, query };
}

function applyCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "600");
  res.setHeader("Vary", "Origin");
}

async function dispatch(req, res) {
  const { pathname, query } = parseRequestUrl(req.url);
  const route = Object.hasOwn(routes, pathname) ? routes[pathname] : undefined;
  if (!route) throw new HttpError(404, "Route not found");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const handler = Object.hasOwn(route, req.method) ? route[req.method] : undefined;
  if (!handler) {
    res.setHeader("Allow", [...Object.keys(route), "OPTIONS"].join(", "));
    throw new HttpError(405, `Method ${req.method} is not allowed on ${pathname}`);
  }
  await handler(req, res, query);
}

// Builds (but does not start) the server so tests can listen on an ephemeral port.
// Pass { logger: null } to silence request logging.
function createServer({ logger = console.log, corsOrigin = process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN } = {}) {
  return http.createServer(async (req, res) => {
    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
      if (!logger) return;
      const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${ms.toFixed(1)}ms`);
    });

    applyCorsHeaders(res, corsOrigin);
    try {
      await dispatch(req, res);
    } catch (err) {
      if (res.headersSent) return res.destroy();
      if (err instanceof HttpError) return sendJson(res, err.status, { message: err.message });
      console.error(err);
      sendJson(res, 500, { message: "Internal server error" });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error(`Invalid PORT: ${process.env.PORT}`);
    process.exit(1);
  }
  const server = createServer();
  server.listen(port, () => {
    console.log(`Food Order API listening on http://localhost:${server.address().port}`);
  });
}

module.exports = { createServer };
