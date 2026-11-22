import api from "../api/client";
import { login, logout, normaliseUser } from "./userActions";
import { listCategories } from "./categoryActions";
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from "../constants/userActionConstants";
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
} from "../constants/categoryActionConstants";

// A factory mock keeps the real axios (an ES module Jest can't parse in CRA) out of the test.
jest.mock("../api/client", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const run = async (thunk, state = { login: {} }) => {
  const dispatch = jest.fn();
  await thunk(dispatch, () => state);
  return dispatch.mock.calls.map(([action]) => action);
};

beforeEach(() => jest.resetAllMocks());

describe("login", () => {
  test("handles the plain-Node API (user object returned directly) and drops the password", async () => {
    api.post.mockResolvedValue({
      data: { id: 1, username: "john35@d", password: "johnd", fullname: "John Doe", email: "john@gmail.com" },
    });

    const actions = await run(login("john35@d", "johnd"));

    expect(api.post).toHaveBeenCalledWith("login", { username: "john35@d", password: "johnd" });
    expect(actions[0]).toEqual({ type: LOGIN_REQUEST });
    expect(actions[1].type).toBe(LOGIN_SUCCESS);
    expect(actions[1].payload).toEqual({
      id: 1,
      username: "john35@d",
      fullname: "John Doe",
      email: "john@gmail.com",
    });
  });

  test("handles the { message, data } envelope used by the Express API", async () => {
    api.post.mockResolvedValue({
      data: { message: "ok", data: { _id: "abc", username: "boss", isAdmin: true, sessionToken: "jwt" } },
    });

    const actions = await run(login("boss", "pw"));

    expect(actions[1].payload).toEqual({ _id: "abc", username: "boss", isAdmin: true, sessionToken: "jwt" });
  });

  test("reports bad credentials with a friendly message", async () => {
    api.post.mockRejectedValue({ response: { status: 403, data: { message: "Invalid Creadentials" } } });

    const actions = await run(login("x", "y"));

    expect(actions[1]).toEqual({ type: LOGIN_FAILURE, payload: "Invalid username or password" });
  });

  test("reports network failures using the underlying message", async () => {
    api.post.mockRejectedValue(new Error("Network Error"));

    const actions = await run(login("x", "y"));

    expect(actions[1]).toEqual({ type: LOGIN_FAILURE, payload: "Network Error" });
  });

  test("rejects a login response that is not a user object", () => {
    expect(() => normaliseUser("<html>")).toThrow();
  });

  test("logout is a plain action", () => {
    expect(logout()).toEqual({ type: LOGOUT });
  });
});

describe("listCategories", () => {
  test("dispatches request then success with the unwrapped array", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, name: "Pizza" }] });

    const actions = await run(listCategories());

    expect(api.get).toHaveBeenCalledWith("categories", {});
    expect(actions).toEqual([
      { type: CATEGORY_LIST_REQUEST },
      { type: CATEGORY_LIST_SUCCESS, payload: [{ id: 1, name: "Pizza" }] },
    ]);
  });

  test("sends the bearer token when the user has one", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await run(listCategories(), { login: { userInfo: { sessionToken: "jwt" } } });

    expect(api.get).toHaveBeenCalledWith("categories", { headers: { Authorization: "Bearer jwt" } });
  });

  test("dispatches a failure instead of throwing when the request fails", async () => {
    api.get.mockRejectedValue(new Error("Network Error"));

    const actions = await run(listCategories());

    expect(actions[1]).toEqual({ type: CATEGORY_LIST_FAIL, payload: "Network Error" });
  });
});
