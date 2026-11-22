import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { appReducers } from "./reducers";

// Renders a component with a fresh, non-persisted store and an in-memory router.
export const renderWithProviders = (ui, { route = "/", preloadedState } = {}) => {
  const store = createStore(combineReducers(appReducers), preloadedState, applyMiddleware(thunk));
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
  return { store, ...utils };
};

export const customer = { id: 1, username: "john35@d", fullname: "John Doe", email: "john@gmail.com" };
export const admin = { ...customer, id: 9, username: "boss", isAdmin: true };
