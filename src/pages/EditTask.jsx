
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { tasks, updateTask, tasksLoading } = useTasks();

  const task = tasks.find(
    (item) => String(item.id) === String(id)
  );

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

  // Load the selected task into the form.
  useEffect(() => {
    if (!task) return;

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      category: task.category || "Work",
      dueDate: task.dueDate || "",
      dueTime: task.dueTime || "",
    });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!task) {
      setError("Task not found. Please return to your task list.");
      return;
    }

    setLoading(true);

    try {
      await updateTask(task.id, {
        ...formData,
        title: formData.title.trim(),
      });

      navigate("/tasks");
    } catch (err) {
      console.error("Failed to update task:", err);

      const data = err.response?.data;
      let message = "Could not update task. Please try again.";

      if (!err.response) {
        message =
          "Cannot connect to the server. Make sure Django is running.";
      } else if (data && typeof data === "object") {
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

  // Wait until tasks have loaded from Django.
  if (tasksLoading) {
    return (
      <div className="empty-tasks">
        <p>Loading task details...</p>
      </div>
    );
  }

  // Show this message if the task doesn't exist.
  if (!task) {
    return (
      <div className="empty-tasks">
        <h2>Task not found</h2>

        <p>
          The task you are trying to edit does not exist.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="task-form-page">
      <div className="page-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/tasks")}
          disabled={loading}
        >
          <ArrowLeft />
          Back
        </button>

        <div>
          <h1>Edit Task</h1>
          <p>Update your task details.</p>
        </div>
      </div>

      <form
        className="task-form-card"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="edit-task-title">
            Task Title *
          </label>

          <input
            id="edit-task-title"
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

        <div className="form-group">
          <label htmlFor="edit-task-description">
            Description
          </label>

          <textarea
            id="edit-task-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your task..."
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-task-priority">
              Priority
            </label>

            <select
              id="edit-task-priority"
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
            <label htmlFor="edit-task-category">
              Category
            </label>

            <select
              id="edit-task-category"
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-task-due-date">
              Due Date
            </label>

            <input
              id="edit-task-due-date"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-task-due-time">
              Due Time
            </label>

            <input
              id="edit-task-due-time"
              type="time"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/tasks")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Updating Task..." : "Update Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTask;
