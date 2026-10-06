
import { useEffect, useState } from "react";
import {
  Person,
  Bell,
  Moon,
  Database,
  Trash,
  CheckCircle,
} from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";

const getSavedSettings = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("taskflow_profile") || "null") || {}
    );
  } catch {
    return {};
  }
};

// Load the saved theme before the component's first render.
const getInitialDarkMode = () => {
  return getSavedSettings().darkMode ?? false;
};

function Settings() {
  const { user, updateUser } = useAuth();
  const { tasks, tasksLoading, clearTasks } = useTasks();

  const [profileName, setProfileName] = useState(() => {
    return getSavedSettings().profileName || user?.name || "";
  });

  const [email, setEmail] = useState(() => {
    return user?.email || getSavedSettings().email || "";
  });

  const [notifications, setNotifications] = useState(() => {
    return getSavedSettings().notifications ?? true;
  });

  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the latest saved settings and account details.
  useEffect(() => {
    const settings = getSavedSettings();

    setProfileName(settings.profileName || user?.name || "");
    setEmail(user?.email || settings.email || "");
    setNotifications(settings.notifications ?? true);
    setDarkMode(settings.darkMode ?? false);
  }, [user?.id, user?.email, user?.name]);

  // Apply the selected theme.
  // Do not remove the class during cleanup; it must persist
  // when navigating between pages.
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Save the theme immediately when its switch changes.
  const handleDarkMode = (event) => {
    const enabled = event.target.checked;

    setDarkMode(enabled);
    setSaved(false);
    setError("");
    setSuccess("");

    try {
      const settings = getSavedSettings();

      localStorage.setItem(
        "taskflow_profile",
        JSON.stringify({
          ...settings,
          darkMode: enabled,
        })
      );
    } catch (err) {
      console.error("Unable to save theme preference:", err);
      setError("Unable to save the theme preference.");
    }
  };

  // Save profile details and all preferences.
  const handleSave = () => {
    setError("");
    setSuccess("");
    setSaved(false);

    const updatedName = profileName.trim();
    const updatedEmail = email.trim();

    if (!updatedName) {
      setError("Please enter your name.");
      return;
    }

    if (!updatedEmail) {
      setError("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(updatedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const settings = {
        ...getSavedSettings(),
        profileName: updatedName,
        email: updatedEmail,
        notifications,
        darkMode,
      };

      localStorage.setItem(
        "taskflow_profile",
        JSON.stringify(settings)
      );

      // Update the frontend authentication context.
      // This does not update the Django account in the database.
      updateUser({
        name: updatedName,
        email: updatedEmail,
      });

      setProfileName(updatedName);
      setEmail(updatedEmail);
      setSaved(true);
      setSuccess("Your settings have been saved.");
    } catch (err) {
      console.error("Unable to save settings:", err);
      setError("Unable to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete all tasks from the backend.
  const handleClearTasks = async () => {
    setError("");
    setSuccess("");

    if (tasksLoading) {
      setError("Please wait until your tasks finish loading.");
      return;
    }

    if (tasks.length === 0) {
      setError("There are no tasks to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete ALL your tasks? This action cannot be undone."
    );

    if (!confirmed) return;

    setClearing(true);

    try {
      await clearTasks();
      setSuccess("All your tasks have been deleted.");
    } catch (err) {
      console.error("Failed to delete tasks:", err);
      setError("Unable to delete all tasks. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const completedCount = tasks.filter(
    (task) => task.status === "completed" || task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your TaskFlow preferences.</p>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="settings-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="settings-saved" role="status">
          <CheckCircle />
          {success}
        </div>
      )}

      {/* Profile */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <Person />
          </div>

          <div>
            <h2>Profile</h2>
            <p>Manage your personal information.</p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-profile">
            <div className="settings-avatar">
              {(profileName || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{profileName || "User"}</h3>
              <span>TaskFlow User</span>
            </div>
          </div>

          <div className="settings-form-row">
            <div className="settings-form-group">
              <label htmlFor="profile-name">Name</label>

              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(event) => {
                  setProfileName(event.target.value);
                  setSaved(false);
                }}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="profile-email">Email</label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSaved(false);
                }}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <Bell />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>Control your task notifications.</p>
          </div>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>Task notifications</strong>
            <span>
              Enable or disable your task notification preference.
            </span>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) => {
                setNotifications(event.target.checked);
                setSaved(false);
              }}
            />
            <span className="settings-slider" />
          </label>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <Moon />
          </div>

          <div>
            <h2>Appearance</h2>
            <p>Customize the appearance of TaskFlow.</p>
          </div>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <strong>Dark Mode</strong>
            <span>Use a darker color theme.</span>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkMode}
            />
            <span className="settings-slider" />
          </label>
        </div>
      </section>

      {/* Storage */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon">
            <Database />
          </div>

          <div>
            <h2>Storage</h2>
            <p>Information about your database tasks.</p>
          </div>
        </div>

        <div className="storage-info">
          <div className="storage-stat">
            <span>Total Tasks</span>
            <strong>{tasksLoading ? "..." : tasks.length}</strong>
          </div>

          <div className="storage-stat">
            <span>Completed</span>
            <strong>{tasksLoading ? "..." : completedCount}</strong>
          </div>

          <div className="storage-stat">
            <span>Pending</span>
            <strong>{tasksLoading ? "..." : pendingCount}</strong>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-card danger-card">
        <div className="settings-card-header">
          <div className="settings-section-icon danger-icon">
            <Trash />
          </div>

          <div>
            <h2>Danger Zone</h2>
            <p>Permanently remove your task data.</p>
          </div>
        </div>

        <div className="danger-content">
          <div>
            <strong>Delete all tasks</strong>
            <p>
              This will permanently remove all tasks stored for your
              account.
            </p>
          </div>

          <button
            className="danger-button"
            onClick={handleClearTasks}
            disabled={clearing || tasksLoading}
          >
            <Trash />
            {clearing ? "Deleting..." : "Delete All Tasks"}
          </button>
        </div>
      </section>

      {/* Save */}
      <div className="settings-actions">
        {saved && (
          <span className="settings-saved">
            <CheckCircle />
            Settings saved
          </span>
        )}

        <button
          className="primary-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
