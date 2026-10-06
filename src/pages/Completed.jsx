
import { useMemo, useState } from "react";
import { CheckCircle, Trash } from "react-bootstrap-icons";
import { useTasks } from "../context/TaskContext";

function Completed() {
  const { tasks, tasksLoading, deleteTask } = useTasks();

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Support both the backend status and the normalized completed field.
  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === "completed" || task.completed === true
      ),
    [tasks]
  );

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(task.id);

    try {
      await deleteTask(task.id);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete the task. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (category) => {
    if (!category) return "Uncategorized";

    if (typeof category === "object") {
      return category.name || category.title || "Uncategorized";
    }

    return category;
  };

  if (tasksLoading) {
    return (
      <div className="completed-page">
        <div className="page-header">
          <h1>Completed Tasks</h1>
          <p>Tasks you have successfully completed.</p>
        </div>

        <div className="empty-tasks">
          <p>Loading completed tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="completed-page">
      <div className="page-header">
        <h1>Completed Tasks</h1>
        <p>Tasks you have successfully completed.</p>
      </div>

      <div className="completed-summary">
        <strong>{completedTasks.length}</strong>
        <span>
          {completedTasks.length === 1
            ? " completed task"
            : " completed tasks"}
        </span>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {completedTasks.length === 0 ? (
        <div className="empty-tasks">
          <div className="empty-icon">
            <CheckCircle />
          </div>

          <h2>No completed tasks</h2>

          <p>
            Complete a task from My Tasks and it will appear here.
          </p>
        </div>
      ) : (
        <div className="tasks-list">
          {completedTasks.map((task) => (
            <div
              className="task-card completed-task"
              key={task.id}
            >
              <div className="completed-check">
                <CheckCircle />
              </div>

              <div className="task-content">
                <div className="task-title-row">
                  <h3>{task.title}</h3>

                  <span
                    className={`priority-badge priority-${task.priority}`}
                  >
                    {task.priority || "medium"}
                  </span>
                </div>

                {task.description && (
                  <p className="task-description">
                    {task.description}
                  </p>
                )}

                <div className="task-meta">
                  <span className="category-badge">
                    {getCategoryName(task.category)}
                  </span>

                  {task.dueDate && (
                    <span>📅 {task.dueDate}</span>
                  )}

                  {task.dueTime && (
                    <span>🕐 {task.dueTime}</span>
                  )}

                  <span>✓ Completed</span>
                </div>
              </div>

              <button
                type="button"
                className="delete-task-button"
                onClick={() => handleDelete(task)}
                title="Delete completed task"
                aria-label={`Delete ${task.title}`}
                disabled={deletingId === task.id}
              >
                {deletingId === task.id ? (
                  "..."
                ) : (
                  <Trash />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Completed;
