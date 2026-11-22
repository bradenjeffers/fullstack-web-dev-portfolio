import { userLoginReducer } from "./userReducers";
import { categoryListReducer } from "./categoryReducers";
import { cuisineListReducer } from "./cuisineReducers";
import { restaurantListReducer } from "./restaurantReducers";
import { localCatalogReducer, initialLocalCatalog } from "./localCatalogReducer";
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from "../constants/userActionConstants";
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
} from "../constants/categoryActionConstants";
import { CUISINE_LIST_SUCCESS } from "../constants/cuisineActionConstants";
import { RESTAURANT_LIST_SUCCESS } from "../constants/restaurantActionConstants";
import { addLocalItem, removeLocalItem } from "../actions/localCatalogActions";

describe("userLoginReducer", () => {
  const user = { id: 1, username: "john35@d" };

  test("starts empty", () => {
    expect(userLoginReducer(undefined, { type: "@@INIT" })).toEqual({});
  });

  test("LOGIN_REQUEST sets loading and clears any previous error", () => {
    const state = userLoginReducer({ error: "old" }, { type: LOGIN_REQUEST });
    expect(state).toEqual({ loading: true, error: null });
  });

  test("LOGIN_SUCCESS stores the user", () => {
    const state = userLoginReducer({ loading: true }, { type: LOGIN_SUCCESS, payload: user });
    expect(state).toEqual({ loading: false, error: null, userInfo: user });
  });

  test("LOGIN_FAILURE stores the error and no user", () => {
    const state = userLoginReducer({ loading: true }, { type: LOGIN_FAILURE, payload: "nope" });
    expect(state).toEqual({ loading: false, error: "nope" });
  });

  test("LOGOUT clears the session", () => {
    expect(userLoginReducer({ userInfo: user }, { type: LOGOUT })).toEqual({});
  });
});

describe("list reducers", () => {
  test("category list: request keeps existing items and flags loading", () => {
    const before = { loading: false, error: null, categories: [{ id: 1 }] };
    expect(categoryListReducer(before, { type: CATEGORY_LIST_REQUEST })).toEqual({
      loading: true,
      error: null,
      categories: [{ id: 1 }],
    });
  });

  test("category list: success replaces items", () => {
    const state = categoryListReducer(undefined, { type: CATEGORY_LIST_SUCCESS, payload: [{ id: 2 }] });
    expect(state.categories).toEqual([{ id: 2 }]);
    expect(state.loading).toBe(false);
  });

  test("category list: failure keeps items and records the error", () => {
    const before = { loading: true, error: null, categories: [{ id: 1 }] };
    const state = categoryListReducer(before, { type: CATEGORY_LIST_FAIL, payload: "boom" });
    expect(state).toEqual({ loading: false, error: "boom", categories: [{ id: 1 }] });
  });

  test("cuisine and restaurant reducers use their own state key", () => {
    expect(cuisineListReducer(undefined, { type: CUISINE_LIST_SUCCESS, payload: [{ id: 1 }] }).cuisines).toHaveLength(1);
    expect(
      restaurantListReducer(undefined, { type: RESTAURANT_LIST_SUCCESS, payload: [{ id: 1 }] }).restaurants
    ).toHaveLength(1);
  });

  test("unrelated actions leave state untouched", () => {
    const state = { loading: false, error: null, categories: [] };
    expect(categoryListReducer(state, { type: "OTHER" })).toBe(state);
  });
});

describe("localCatalogReducer", () => {
  test("adds an item to the right collection without mutating the old state", () => {
    const action = addLocalItem("categories", { name: "Sushi" });
    const next = localCatalogReducer(initialLocalCatalog, action);

    expect(next.categories).toHaveLength(1);
    expect(next.categories[0]).toMatchObject({ name: "Sushi", local: true });
    expect(next.cuisines).toEqual([]);
    expect(initialLocalCatalog.categories).toEqual([]);
  });

  test("generated ids are unique", () => {
    const a = addLocalItem("cuisines", { name: "A" }).item.id;
    const b = addLocalItem("cuisines", { name: "B" }).item.id;
    expect(a).not.toEqual(b);
  });

  test("removes only the item with the given id", () => {
    const first = addLocalItem("restaurants", { name: "One" });
    const second = addLocalItem("restaurants", { name: "Two" });
    let state = localCatalogReducer(initialLocalCatalog, first);
    state = localCatalogReducer(state, second);

    state = localCatalogReducer(state, removeLocalItem("restaurants", first.item.id));
    expect(state.restaurants.map((item) => item.name)).toEqual(["Two"]);
  });
});
