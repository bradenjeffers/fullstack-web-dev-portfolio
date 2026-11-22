import React from "react";
import { Alert } from "react-bootstrap";

const AlertMessage = ({ variant, message }) => (
  <Alert variant={variant}>
    <i className="bi bi-exclamation-diamond-fill" aria-hidden="true" />{" "}
    {message}
  </Alert>
);

export default AlertMessage;
