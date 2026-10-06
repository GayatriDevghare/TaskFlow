import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <AuthProvider>

      <TaskProvider>
        <App />
      </TaskProvider>

    </AuthProvider>

  </React.StrictMode>
);