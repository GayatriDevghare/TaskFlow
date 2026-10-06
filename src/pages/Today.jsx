
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar3,
  CheckCircle,
  Circle,
  Clock,
  ExclamationCircle,
  Pencil,
} from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";

function Today() {
  const {
    tasks,
    toggleTask,
    tasksLoading,
  } = useTasks();

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Get today's date using the local timezone.
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const taskGroups = useMemo(() => {
    // Only show tasks that are not completed.
    const pendingTasks = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        !task.completed
    );

    const overdue = pendingTasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < today
    );

    const todayTasks = pendingTasks.filter(
      (task) => task.dueDate === today
    );

    const upcoming = pendingTasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate > today
    );

    return {
      overdue,
      todayTasks,
      upcoming,
    };
  }, [tasks, today]);

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    const dateObject = new Date(`${date}T00:00:00`);

    return dateObject.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority || "medium"}`;
  };

  const handleToggleTask = async (taskId) => {
    setError("");
    setUpdatingTaskId(taskId);

    try {
      await toggleTask(taskId);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update the task. Please try again."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderTask = (task) => (
    <div className="today-task-card" key={task.id}>
      <button
        className="task-check-button"
        onClick={() => handleToggleTask(task.id)}
        disabled={updatingTaskId === task.id}
        title="Mark as completed"
        aria-label={`Mark ${task.title} as completed`}
      >
        <Circle />
      </button>

      <div
        className="today-task-content"
        onClick={() => navigate(`/task/${task.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/task/${task.id}`);
          }
        }}
      >
        <div className="today-task-title-row">
          <h3>{task.title}</h3>

          <span
            className={`priority-badge ${getPriorityClass(
              task.priority
            )}`}
          >
            {task.priority || "medium"}
          </span>
        </div>

        {task.description && <p>{task.description}</p>}

        <div className="today-task-meta">
          <span>
            <Calendar3 />
            {formatDate(task.dueDate)}
          </span>

          {task.dueTime && (
            <span>
              <Clock />
              {task.dueTime}
            </span>
          )}

          {task.category && <span>{task.category}</span>}
        </div>
      </div>

      <button
        className="today-edit-button"
        onClick={() => navigate(`/edit-task/${task.id}`)}
        title="Edit task"
        aria-label={`Edit ${task.title}`}
      >
        <Pencil />
      </button>
    </div>
  );

  const renderSection = ({
    title,
    description,
    icon,
    sectionTasks,
    emptyMessage,
  }) => (
    <section className="today-section">
      <div className="today-section-header">
        <div>
          <h2>
            {icon}
            {title}
          </h2>

          <p>{description}</p>
        </div>

        <span className="today-count">
          {sectionTasks.length}
        </span>
      </div>

      {sectionTasks.length === 0 ? (
        <div className="today-empty">
          <CheckCircle />
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className="today-task-list">
          {sectionTasks.map(renderTask)}
        </div>
      )}
    </section>
  );

  return (
    <div className="today-page">
      {/* Header */}
      <div className="today-header">
        <div>
          <h1>Today</h1>
          <p>Stay focused on what needs to be done.</p>
        </div>

        <div className="today-date">
          <Calendar3 />

          <span>
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Loading */}
      {tasksLoading && (
        <div className="today-empty">
          <span>Loading your tasks...</span>
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="today-empty" role="alert">
          <ExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {!tasksLoading && (
        <>
          {/* Summary */}
          <div className="today-summary">
            <div className="today-summary-card">
              <div className="today-summary-icon">
                <ExclamationCircle />
              </div>

              <div>
                <span>Overdue</span>
                <strong>{taskGroups.overdue.length}</strong>
              </div>
            </div>

            <div className="today-summary-card">
              <div className="today-summary-icon">
                <Clock />
              </div>

              <div>
                <span>Due Today</span>
                <strong>{taskGroups.todayTasks.length}</strong>
              </div>
            </div>

            <div className="today-summary-card">
              <div className="today-summary-icon">
                <Calendar3 />
              </div>

              <div>
                <span>Upcoming</span>
                <strong>{taskGroups.upcoming.length}</strong>
              </div>
            </div>
          </div>

          {/* Overdue */}
          {renderSection({
            title: "Overdue",
            description: "Tasks that need your attention.",
            icon: <ExclamationCircle />,
            sectionTasks: taskGroups.overdue,
            emptyMessage: "No overdue tasks. Great job!",
          })}

          {/* Due Today */}
          {renderSection({
            title: "Due Today",
            description: "Focus on these tasks today.",
            icon: <Clock />,
            sectionTasks: taskGroups.todayTasks,
            emptyMessage: "No tasks due today.",
          })}

          {/* Upcoming */}
          {renderSection({
            title: "Upcoming",
            description: "Tasks scheduled for future dates.",
            icon: <Calendar3 />,
            sectionTasks: taskGroups.upcoming,
            emptyMessage: "No upcoming tasks.",
          })}
        </>
      )}
    </div>
  );
}

export default Today;
