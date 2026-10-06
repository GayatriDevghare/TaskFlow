
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";

function AddTask() {
  const navigate = useNavigate();
  const { addTask } = useTasks();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Work",
    dueDate: "",
    dueTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // Submit task to the Django API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setLoading(true);

    try {
      await addTask({
        ...formData,
        title: formData.title.trim(),
        status: "todo",
      });

      navigate("/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);

      const data = err.response?.data;
      let message =
        "Could not create task. Please try again.";

      if (!err.response) {
        message =
          "Cannot connect to the server. Make sure Django is running.";
      } else if (data) {
        const firstError = Object.values(data).flat()[0];

        if (firstError) {
          message = String(firstError);
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <ArrowLeft />
          Back
        </button>

        <div>
          <h1>Add New Task</h1>
          <p>Create a new task and stay organized.</p>
        </div>
      </div>

      {/* TASK FORM */}
      <form
        className="task-form-card"
        onSubmit={handleSubmit}
      >
        {/* ERROR MESSAGE */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* TASK TITLE */}
        <div className="form-group">
          <label htmlFor="task-title">
            Task Title *
          </label>

          <input
            id="task-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
            maxLength={200}
            disabled={loading}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label htmlFor="task-description">
            Description
          </label>

          <textarea
            id="task-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your task..."
            rows={4}
            disabled={loading}
          />
        </div>

        {/* PRIORITY AND CATEGORY */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-priority">
              Priority
            </label>

            <select
              id="task-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-category">
              Category
            </label>

            <select
              id="task-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Coding">Coding</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* DUE DATE AND TIME */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-due-date">
              Due Date
            </label>

            <input
              id="task-due-date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-due-time">
              Due Time
            </label>

            <input
              id="task-due-time"
              type="time"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Creating Task..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTask;