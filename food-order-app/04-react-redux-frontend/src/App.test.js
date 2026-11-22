import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import api from "./api/client";
import { renderWithProviders, customer, admin } from "./test-utils";

jest.mock("./api/client", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const CATALOGUE = {
  cuisines: [{ id: 1, name: "Italian", image: "" }],
  categories: [{ id: 1, name: "Pizza", image: "" }],
  restaurants: [{ id: 1, name: "Flavor Fusion", image: "" }],
};

beforeEach(() => {
  jest.resetAllMocks();
  api.get.mockImplementation((endpoint) => Promise.resolve({ data: CATALOGUE[endpoint] || [] }));
});

test("signed-out visitors are sent to the login form", () => {
  renderWithProviders(<App />, { route: "/" });

  expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
});

test("a signed-in customer sees fetched cuisines, categories and restaurants, and can sign out", async () => {
  renderWithProviders(<App />, { route: "/", preloadedState: { login: { userInfo: customer } } });

  expect(await screen.findByText("Italian")).toBeInTheDocument();
  expect(await screen.findByText("Pizza")).toBeInTheDocument();
  expect(await screen.findByText("Flavor Fusion")).toBeInTheDocument();
  expect(screen.queryByText(/admin dashboard/i, { selector: "a" })).not.toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: /sign out/i }));

  expect(await screen.findByRole("heading", { name: /log in/i })).toBeInTheDocument();
});

test("customers cannot open the admin dashboard", async () => {
  renderWithProviders(<App />, { route: "/admin", preloadedState: { login: { userInfo: customer } } });

  expect(await screen.findByText("Try New Cuisines")).toBeInTheDocument();
});

test("an admin can add a category and then find it in the list", async () => {
  renderWithProviders(<App />, { route: "/admin/categories/new", preloadedState: { login: { userInfo: admin } } });

  userEvent.type(screen.getByLabelText(/category name/i), "Sushi");
  userEvent.click(screen.getByRole("button", { name: /add category/i }));

  expect(await screen.findByText("Category added")).toBeInTheDocument();
  expect(screen.getByLabelText(/category name/i)).toHaveValue("");

  userEvent.click(screen.getByRole("link", { name: /view categories/i }));

  expect(await screen.findByText("Sushi")).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument());
});
