import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const logIn = (username, password) => {
  userEvent.type(screen.getByLabelText(/username/i), username);
  userEvent.type(screen.getByLabelText(/password/i), password);
  userEvent.click(screen.getByRole("button", { name: /^login$/i }));
};

beforeEach(() => {
  window.sessionStorage.clear();
});

test("shows the login form to anonymous visitors", () => {
  render(<App />);
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
});

test("requires both username and password", () => {
  render(<App />);
  userEvent.click(screen.getByRole("button", { name: /^login$/i }));
  expect(screen.getByRole("alert")).toHaveTextContent(/are required/i);
});

test("rejects a wrong password", () => {
  render(<App />);
  logIn("ron1993", "not-the-password");
  expect(screen.getByRole("alert")).toHaveTextContent(/incorrect/i);
  expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
});

test("regular user sees the home page, and can sign out again", () => {
  render(<App />);
  logIn("ron1993", "demo-user-pass");

  expect(
    screen.getByRole("heading", { name: /try new cuisines/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
  expect(window.sessionStorage.getItem("loggedInUser")).not.toMatch(
    /password/i
  );

  userEvent.click(screen.getByText(/sign out/i));
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(window.sessionStorage.getItem("loggedInUser")).toBeNull();
});

test("admin sees the dashboard instead of the home page", () => {
  render(<App />);
  logIn("harry1992", "demo-admin-pass");

  expect(
    screen.getByRole("heading", { name: /^admin dashboard$/i, level: 2 })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /try new cuisines/i })
  ).not.toBeInTheDocument();
});

test("restores the session after a refresh", () => {
  const { unmount } = render(<App />);
  logIn("ron1993", "demo-user-pass");
  unmount();

  render(<App />);
  const nav = screen.getByRole("banner");
  expect(within(nav).getByText(/sign out/i)).toBeInTheDocument();
});
