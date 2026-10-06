
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash,
  CheckCircle,
  Circle,
  Calendar3,
  Clock,
  Tags,
  Flag,
} from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tasks,
    tasksLoading,
    deleteTask,
    toggleTask,
  } = useTasks();

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const task = tasks.find(
    (item) => String(item.id) === String(id)
  );

  const isCompleted =
    task?.status === "completed" || task?.completed === true;

  const getErrorMessage = (err, fallback) => {
    if (!err.response) {
      return "Cannot connect to the server. Make sure Django is running.";
    }

    const data = err.response.data;

    if (data && typeof data === "object") {
      const firstError = Object.values(data).flat()[0];

      if (firstError) return String(firstError);
    }

    return fallback;
  };

  const handleToggle = async () => {
    if (!task || actionLoading) return;

    setActionLoading(true);
    setError("");

    try {
      await toggleTask(task.id);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError(
        getErrorMessage(err, "Could not update task status.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || actionLoading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteTask(task.id);
      navigate("/tasks", { replace: true });
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError(
        getErrorMessage(err, "Could not delete task.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Wait for the task list to load from Django.
  if (tasksLoading) {
    return (
      <div className="empty-tasks">
        <p>Loading task details...</p>
      </div>
    );
  }

  // Task not found.
  if (!task) {
    return (
      <div className="empty-tasks">
        <h2>Task not found</h2>

        <p>
          The task you are looking for does not exist.
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

  const statusLabel = isCompleted
    ? "Completed"
    : task.status === "in-progress"
    ? "In Progress"
    : "Pending";

  return (
    <div className="task-details-page">
      {/* Header */}
      <div className="details-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft />
          Back to Tasks
        </button>
      </div>

      {/* Task Card */}
      <div className="task-details-card">
        {/* Title Section */}
        <div className="details-title-section">
          <div className="details-status-icon">
            {isCompleted ? <CheckCircle /> : <Circle />}
          </div>

          <div className="details-title-content">
            <div className="details-title-row">
              <h1>{task.title}</h1>

              <span
                className={`priority-badge priority-${task.priority}`}
              >
                {task.priority}
              </span>
            </div>

            <p>
              {isCompleted
                ? "This task has been completed."
                : "This task is still pending."}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Description */}
        <div className="details-section">
          <h3>Description</h3>

          <p className="details-description">
            {task.description ||
              "No description added for this task."}
          </p>
        </div>

        {/* Task Information */}
        <div className="details-section">
          <h3>Task Information</h3>

          <div className="details-info-grid">
            {/* Status */}
            <div className="details-info-item">
              <div className="details-info-icon">
                <CheckCircle />
              </div>

              <div>
                <span>Status</span>
                <strong>{statusLabel}</strong>
              </div>
            </div>

            {/* Priority */}
            <div className="details-info-item">
              <div className="details-info-icon">
                <Flag />
              </div>

              <div>
                <span>Priority</span>
                <strong>{task.priority || "Medium"}</strong>
              </div>
            </div>

            {/* Category */}
            <div className="details-info-item">
              <div className="details-info-icon">
                <Tags />
              </div>

              <div>
                <span>Category</span>
                <strong>{task.category || "None"}</strong>
              </div>
            </div>

            {/* Due Date */}
            <div className="details-info-item">
              <div className="details-info-icon">
                <Calendar3 />
              </div>

              <div>
                <span>Due Date</span>
                <strong>{task.dueDate || "No due date"}</strong>
              </div>
            </div>

            {/* Due Time */}
            <div className="details-info-item">
              <div className="details-info-icon">
                <Clock />
              </div>

              <div>
                <span>Due Time</span>
                <strong>{task.dueTime || "No due time"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="details-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleToggle}
            disabled={actionLoading}
          >
            {isCompleted ? (
              <>
                <Circle />
                Mark as Pending
              </>
            ) : (
              <>
                <CheckCircle />
                Mark as Completed
              </>
            )}
          </button>

          <button
            type="button"
            className="edit-details-button"
            onClick={() => navigate(`/edit-task/${task.id}`)}
            disabled={actionLoading}
          >
            <Pencil />
            Edit Task
          </button>

          <button
            type="button"
            className="delete-details-button"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            <Trash />
            {actionLoading ? "Please wait..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;
