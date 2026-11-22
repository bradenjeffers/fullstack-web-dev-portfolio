import React, { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import { login } from "../actions/userActions";
import { isAdmin } from "../utils/apiHelpers";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading, error, userInfo } = useSelector((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (userInfo) {
    return <Navigate to={isAdmin(userInfo) ? "/admin" : "/"} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(login(username.trim(), password));
  };

  return (
    <Form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">Log in</h2>
      {error && <AlertMessage variant="danger" message={error} />}
      <Form.Group controlId="username" className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="password" className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mb-3" disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" role="status" aria-label="Logging in" /> : "Login"}
      </Button>
    </Form>
  );
};

export default LoginPage;
