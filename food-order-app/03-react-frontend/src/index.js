import React from "react";
import ReactDOM from "react-dom/client";
// Vendored Bootswatch "Flatly" 5.2.3: a compiled Bootstrap 5 theme, so it is
// not a duplicate of the plain Bootstrap package (which is therefore not a
// dependency). Bootstrap Icons are loaded from a CDN in public/index.html.
import "./bootstrap.min.css";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
