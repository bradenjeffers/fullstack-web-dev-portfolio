import React from "react";
import { Alert } from "react-bootstrap";

const AlertMessage = ({ variant = "info", message }) => (
  <Alert variant={variant}>
    <i className="bi bi-exclamation-diamond-fill me-2" aria-hidden="true" />
    {message}
  </Alert>
);

export default AlertMessage;
