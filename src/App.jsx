
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Today from "./pages/Today";
import Completed from "./pages/Completed";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import TaskDetails from "./pages/TaskDetails";

import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  // Restore the saved theme whenever the app starts.
  useEffect(() => {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem("taskflow_profile") || "{}"
      );

      const darkMode = savedSettings.darkMode ?? false;

      document.body.classList.toggle("dark-mode", darkMode);
      document.documentElement.classList.toggle(
        "dark-mode",
        darkMode
      );
    } catch (error) {
      console.error("Unable to restore theme:", error);
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route path="/add-task" element={<AddTask />} />

            <Route
              path="/edit-task/:id"
              element={<EditTask />}
            />

            <Route
              path="/task/:id"
              element={<TaskDetails />}
            />

            <Route path="/today" element={<Today />} />

            <Route path="/completed" element={<Completed />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/categories" element={<Categories />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
