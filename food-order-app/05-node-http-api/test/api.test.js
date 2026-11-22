const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");

const { createServer } = require("../server");

let server;
let base;

before(async () => {
  server = createServer({ logger: null });
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

async function get(pathAndQuery, options) {
  const res = await fetch(base + pathAndQuery, options);
  return { res, body: await res.json() };
}

function post(pathname, rawBody, headers = { "Content-Type": "application/json" }) {
  return get(pathname, { method: "POST", headers, body: rawBody });
}

const login = (credentials) => post("/v1/login", JSON.stringify(credentials));

describe("collections", () => {
  const expectedCounts = {
    "/v1/categories": 15,
    "/v1/cuisines": 10,
    "/v1/restaurants": 10,
    "/v1/fooditems": 20,
    "/v1/menus": 10,
    "/v1/menuitems": 25,
    "/v1/users": 4,
  };

  for (const [route, count] of Object.entries(expectedCounts)) {
    test(`GET ${route} returns ${count} records as JSON`, async () => {
      const { res, body } = await get(route);
      assert.equal(res.status, 200);
      assert.match(res.headers.get("content-type"), /^application\/json/);
      assert.equal(body.length, count);
    });
  }

  test("a trailing slash is accepted", async () => {
    const { res, body } = await get("/v1/categories/");
    assert.equal(res.status, 200);
    assert.equal(body.length, 15);
  });
});

describe("lookup by id", () => {
  for (const route of ["categories", "cuisines", "restaurants", "fooditems", "menus", "menuitems"]) {
    test(`GET /v1/${route}?id=2 returns record 2`, async () => {
      const { res, body } = await get(`/v1/${route}?id=2`);
      assert.equal(res.status, 200);
      assert.equal(body.id, 2);
    });

    test(`GET /v1/${route}?id=9999 is a 404 with a message`, async () => {
      const { res, body } = await get(`/v1/${route}?id=9999`);
      assert.equal(res.status, 404);
      assert.match(body.message, /9999/);
    });
  }

  test("an empty id is a 400", async () => {
    const { res } = await get("/v1/categories?id=");
    assert.equal(res.status, 400);
  });
});

describe("restaurants filters", () => {
  test("?cuisine= matches by cuisine name, case-insensitively", async () => {
    const { res, body } = await get("/v1/restaurants?cuisine=italian");
    assert.equal(res.status, 200);
    assert.ok(body.length > 0 && body.length < 10);
    assert.ok(body.every((restaurant) => restaurant.name && restaurant.id));
  });

  test("?category= matches by category name", async () => {
    const { res, body } = await get("/v1/restaurants?category=Pizza");
    assert.equal(res.status, 200);
    assert.ok(body.length > 0);
  });

  test("cuisine and category together narrow the result", async () => {
    const cuisineOnly = (await get("/v1/restaurants?cuisine=Italian")).body;
    const both = (await get("/v1/restaurants?cuisine=Italian&category=Pizza")).body;
    assert.ok(both.length <= cuisineOnly.length);
    const cuisineIds = new Set(cuisineOnly.map((restaurant) => restaurant.id));
    assert.ok(both.every((restaurant) => cuisineIds.has(restaurant.id)));
  });

  test("unknown cuisine or category names are 404s", async () => {
    assert.equal((await get("/v1/restaurants?cuisine=Martian")).res.status, 404);
    assert.equal((await get("/v1/restaurants?category=Gravel")).res.status, 404);
  });
});

describe("menuitems by restaurant", () => {
  test("returns display rows for the restaurant's menu", async () => {
    const { res, body } = await get("/v1/menuitems?restaurantId=1");
    assert.equal(res.status, 200);
    assert.ok(body.length > 0);
    for (const row of body) {
      assert.deepEqual(Object.keys(row), [
        "Menuitem Id",
        "Fooditem Id",
        "Fooditem Name",
        "Fooditem Image",
        "Fooditem Price",
      ]);
    }
  });

  test("categoryId moves matching dishes to the front without dropping any", async () => {
    const plain = (await get("/v1/menuitems?restaurantId=1")).body;
    const fooditems = (await get("/v1/fooditems")).body;
    const categoryOf = (row) => fooditems.find((item) => item.id === row["Fooditem Id"]).categoryId;

    // Choose the category of the last dish so reordering must actually change something.
    const categoryId = categoryOf(plain.at(-1));
    const { res, body } = await get(`/v1/menuitems?restaurantId=1&categoryId=${categoryId}`);

    assert.equal(res.status, 200);
    assert.equal(body.length, plain.length);
    assert.equal(categoryOf(body[0]), categoryId);
    const matches = body.map((row) => categoryOf(row) === categoryId);
    assert.deepEqual(matches, [...matches].sort((a, b) => Number(b) - Number(a)));
  });

  test("unknown restaurant, category or cuisine is a 404", async () => {
    assert.equal((await get("/v1/menuitems?restaurantId=9999")).res.status, 404);
    assert.equal((await get("/v1/menuitems?restaurantId=1&categoryId=9999")).res.status, 404);
    assert.equal((await get("/v1/menuitems?restaurantId=1&cuisineId=9999")).res.status, 404);
  });

  test("categoryId without restaurantId is a 400", async () => {
    assert.equal((await get("/v1/menuitems?categoryId=1")).res.status, 400);
  });
});

describe("users and login", () => {
  test("user endpoints never expose the password field", async () => {
    const all = (await get("/v1/users")).body;
    assert.ok(all.every((user) => !("password" in user)));

    const { res, body } = await get(`/v1/users?username=${encodeURIComponent("john35@d")}`);
    assert.equal(res.status, 200);
    assert.equal(body.fullname, "John Doe");
    assert.ok(!("password" in body));
  });

  test("unknown username is a 404", async () => {
    assert.equal((await get("/v1/users?username=nobody")).res.status, 404);
  });

  test("valid demo credentials return the bare user object without a password", async () => {
    const { res, body } = await login({ username: "john35@d", password: "johnd" });
    assert.equal(res.status, 200);
    assert.deepEqual(body, { id: 1, email: "john@gmail.com", username: "john35@d", fullname: "John Doe" });
  });

  test("wrong password and unknown user both give the same 401", async () => {
    const wrongPassword = await login({ username: "john35@d", password: "nope" });
    const unknownUser = await login({ username: "ghost", password: "johnd" });
    assert.equal(wrongPassword.res.status, 401);
    assert.equal(unknownUser.res.status, 401);
    assert.deepEqual(wrongPassword.body, unknownUser.body);
  });

  test("missing or non-string fields are a 400", async () => {
    assert.equal((await login({ username: "john35@d" })).res.status, 400);
    assert.equal((await login({ username: 1, password: 2 })).res.status, 400);
  });

  test("malformed JSON is a 400 and does not crash the server", async () => {
    const bad = await post("/v1/login", "{not json");
    assert.equal(bad.res.status, 400);
    assert.equal((await post("/v1/login", "")).res.status, 400);
    assert.equal((await post("/v1/login", "[1,2]")).res.status, 400);
    // Still alive afterwards.
    assert.equal((await get("/v1/categories")).res.status, 200);
  });

  test("an oversized body is a 413", async () => {
    const { res } = await post("/v1/login", JSON.stringify({ username: "x".repeat(100_000), password: "y" }));
    assert.equal(res.status, 413);
  });

  test("GET /v1/login is a 405 with an Allow header", async () => {
    const { res } = await get("/v1/login");
    assert.equal(res.status, 405);
    assert.match(res.headers.get("allow"), /POST/);
  });
});

describe("routing, methods and CORS", () => {
  test("unknown route is a JSON 404", async () => {
    const { res, body } = await get("/v1/nothing");
    assert.equal(res.status, 404);
    assert.equal(body.message, "Route not found");
  });

  test("unsupported method on a known route is a 405", async () => {
    const { res } = await post("/v1/categories", "{}");
    assert.equal(res.status, 405);
    assert.match(res.headers.get("allow"), /GET/);
  });

  test("responses carry the CORS origin for the React dev server", async () => {
    const { res } = await get("/v1/categories");
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });

  test("OPTIONS preflight returns 204 with CORS headers", async () => {
    const res = await fetch(base + "/v1/login", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    assert.equal(res.status, 204);
    assert.match(res.headers.get("access-control-allow-methods"), /POST/);
    assert.match(res.headers.get("access-control-allow-headers"), /Content-Type/i);
  });

  test("CORS origin is configurable", async () => {
    const custom = createServer({ logger: null, corsOrigin: "https://example.test" });
    await new Promise((resolve) => custom.listen(0, resolve));
    try {
      const res = await fetch(`http://localhost:${custom.address().port}/v1/cuisines`);
      assert.equal(res.headers.get("access-control-allow-origin"), "https://example.test");
    } finally {
      await new Promise((resolve) => custom.close(resolve));
    }
  });

  test("each request is logged as one line", async () => {
    const lines = [];
    const logged = createServer({ logger: (line) => lines.push(line) });
    await new Promise((resolve) => logged.listen(0, resolve));
    try {
      await fetch(`http://localhost:${logged.address().port}/v1/cuisines?id=1`);
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(lines.length, 1);
      assert.match(lines[0], /^\d{4}-\d{2}-\d{2}T[\d:.]+Z GET \/v1\/cuisines\?id=1 200 [\d.]+ms$/);
    } finally {
      await new Promise((resolve) => logged.close(resolve));
    }
  });
});

describe("running server.js directly", () => {
  test("starts from another working directory and honours PORT", async () => {
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
      cwd: os.tmpdir(),
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "inherit"],
    });
    try {
      const port = await new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code) => reject(new Error(`server exited early with code ${code}`)));
        child.stdout.on("data", (chunk) => {
          const match = /localhost:(\d+)/.exec(chunk.toString());
          if (match) resolve(Number(match[1]));
        });
      });
      const res = await fetch(`http://localhost:${port}/v1/cuisines`);
      assert.equal(res.status, 200);
      assert.equal((await res.json()).length, 10);
    } finally {
      child.removeAllListeners("exit");
      child.kill();
    }
  });
});
