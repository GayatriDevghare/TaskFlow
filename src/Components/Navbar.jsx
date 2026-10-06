
import { useEffect, useState } from "react";
import {
  List,
  Bell,
  Search,
  Moon,
  Sun,
  BoxArrowRight,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const getSavedDarkMode = () => {
  try {
    const settings = JSON.parse(
      localStorage.getItem("taskflow_profile") || "{}"
    );

    return settings.darkMode ?? false;
  } catch {
    return false;
  }
};

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Initialize the button from the saved preference.
  const [darkMode, setDarkMode] = useState(getSavedDarkMode);

  // Apply the theme globally and keep the saved preference synchronized.
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.documentElement.classList.toggle("dark-mode", darkMode);

    try {
      const settings = JSON.parse(
        localStorage.getItem("taskflow_profile") || "{}"
      );

      localStorage.setItem(
        "taskflow_profile",
        JSON.stringify({
          ...settings,
          darkMode,
        })
      );
    } catch (error) {
      console.error("Unable to save theme preference:", error);
    }
  }, [darkMode]);

  // Toggle theme from the Navbar.
  const toggleDarkMode = () => {
    setDarkMode((previousMode) => !previousMode);
  };

  // Logout.
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();
    navigate("/login");
  };

  return (
    <header className="top-navbar">
      {/* Left section */}
      <div className="navbar-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          title="Open menu"
          type="button"
        >
          <List />
        </button>

        <div className="mobile-brand">TaskFlow</div>
      </div>

      {/* Search */}
      <div className="navbar-search">
        <Search />

        <input
          type="text"
          placeholder="Search tasks..."
          aria-label="Search tasks"
        />
      </div>

      {/* Right section */}
      <div className="navbar-actions">
        {/* Dark mode */}
        <button
          className="navbar-icon-button"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={darkMode}
          type="button"
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>

        {/* Notifications */}
        <button
          className="navbar-icon-button"
          title="Notifications"
          aria-label="Notifications"
          type="button"
        >
          <Bell />
        </button>

        {/* User profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
          </div>
        </div>

        {/* Logout */}
        <button
          className="navbar-icon-button logout-button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          type="button"
        >
          <BoxArrowRight />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
