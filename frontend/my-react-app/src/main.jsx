// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./styles/styles.css";
// learnsphere public-site design system (scoped to .ls-site; must load after legacy styles).
import "./styles/learnsphere.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

