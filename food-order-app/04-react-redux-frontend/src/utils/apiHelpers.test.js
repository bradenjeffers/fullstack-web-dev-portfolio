import { unwrap, unwrapList, errorMessage, itemId, authConfig, isAdmin } from "./apiHelpers";

describe("unwrap", () => {
  test("returns the body as-is when the API sends the payload directly (05)", () => {
    expect(unwrap({ data: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(unwrap({ data: { id: 1, username: "a" } })).toEqual({ id: 1, username: "a" });
  });

  test("unwraps { message, data } envelopes (06)", () => {
    expect(unwrap({ data: { message: "ok", data: [{ _id: "a" }] } })).toEqual([{ _id: "a" }]);
  });
});

describe("unwrapList", () => {
  test("rejects a non-array payload instead of passing it to the UI", () => {
    expect(() => unwrapList({ data: { message: "Route not found" } })).toThrow();
    expect(() => unwrapList({ data: "<html>" })).toThrow();
  });
});

describe("errorMessage", () => {
  test("prefers the server's message, then its error field, then the axios message", () => {
    expect(errorMessage({ response: { data: { message: "from server" } } })).toBe("from server");
    expect(errorMessage({ response: { data: { error: "bad" } } })).toBe("bad");
    expect(errorMessage({ message: "Network Error" })).toBe("Network Error");
    expect(errorMessage(undefined, "fallback")).toBe("fallback");
  });
});

describe("small helpers", () => {
  test("itemId supports id and _id", () => {
    expect(itemId({ id: 3 })).toBe(3);
    expect(itemId({ _id: "abc" })).toBe("abc");
  });

  test("authConfig adds a bearer token only when one exists", () => {
    const withToken = () => ({ login: { userInfo: { sessionToken: "t0k" } } });
    const without = () => ({ login: {} });
    expect(authConfig(withToken)).toEqual({ headers: { Authorization: "Bearer t0k" } });
    expect(authConfig(without)).toEqual({});
  });

  test("isAdmin is false for missing users", () => {
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin({ isAdmin: true })).toBe(true);
  });
});
