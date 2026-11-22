import React from "react";
import { Button, Form } from "react-bootstrap";
import AlertMessage from "../components/AlertMessage";
import { credentials } from "../credentials";
import { users } from "../users";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = username.trim();

    if (name === "" || password === "") {
      setError("Username and password are required");
      return;
    }

    // hasOwn avoids matching inherited keys such as "constructor".
    const isValid =
      Object.prototype.hasOwnProperty.call(credentials, name) && credentials[name] === password;
    const user = isValid ? users.find((u) => u.username === name) : undefined;

    if (!user) {
      setError("Username or password is incorrect");
      return;
    }
    setError("");
    onLogin(user);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label="Log in">
      <h2 className="h3 mb-3">Log in</h2>
      {error && <AlertMessage variant="danger" message={error} />}
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(event) => {
            setError("");
            setUsername(event.target.value);
          }}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setError("");
            setPassword(event.target.value);
          }}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mb-3">
        Login
      </Button>
      <p className="text-muted">
        Registration is not available in this demo. See the README for the demo
        accounts.
      </p>
    </Form>
  );
};

export default LoginPage;
