
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  CheckCircle,
  Clock,
  ExclamationCircle,
  ListCheck,
} from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Dashboard() {
  const { tasks, tasksLoading } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const userName =
    user?.first_name ||
    user?.name ||
    user?.username ||
    "User";

  // Use the local calendar date rather than UTC.
  const today = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0"),
  ].join("-");

  // Load statistics from Django.
  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const response = await api.get("tasks/summary/");

        if (!cancelled) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);

        if (!cancelled) {
          setSummaryError(
            "Could not load dashboard statistics from the server."
          );
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  // Use API summary values for statistics.
  // Fall back to the loaded task list if the summary request fails.
  const statistics = useMemo(() => {
    const completed = tasks.filter(
      (task) =>
        task.status === "completed" ||
        task.completed === true
    ).length;

    const pending = tasks.filter(
      (task) =>
        task.status === "todo" &&
        task.completed !== true
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const overdue = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        !task.completed &&
        task.dueDate &&
        task.dueDate < today
    ).length;

    return {
      total: Number(summary?.total ?? tasks.length),
      completed: Number(summary?.completed ?? completed),
      pending: Number(
        summary?.pending ?? pending
      ),
      inProgress: Number(
        summary?.in_progress ?? inProgress
      ),
      overdue: Number(summary?.overdue ?? overdue),
    };
  }, [summary, tasks, today]);

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate === today &&
          task.status !== "completed" &&
          !task.completed
      ),
    [tasks, today]
  );

  const productivity =
    statistics.total === 0
      ? 0
      : Math.round(
          (statistics.completed / statistics.total) * 100
        );

  const isLoading = tasksLoading || summaryLoading;

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {userName} 👋</h1>
          <p>Here's what's happening with your tasks today.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/add-task")}
        >
          <Plus />
          Add Task
        </button>
      </div>

      {/* Statistics */}
      {summaryError && (
        <div className="auth-error" role="alert">
          {summaryError} Showing statistics from the available task list.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ListCheck />
          </div>
          <div>
            <span>Total Tasks</span>
            <h2>{isLoading ? "..." : statistics.total}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock />
          </div>
          <div>
            <span>Pending</span>
            <h2>{isLoading ? "..." : statistics.pending}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div>
            <span>Completed</span>
            <h2>{isLoading ? "..." : statistics.completed}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ExclamationCircle />
          </div>
          <div>
            <span>Overdue</span>
            <h2>{isLoading ? "..." : statistics.overdue}</h2>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-grid">
        {/* Today's Tasks */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Today's Tasks</h2>
              <p>Your tasks scheduled for today.</p>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() => navigate("/tasks")}
            >
              View All
            </button>
          </div>

          {tasksLoading ? (
            <div className="empty-dashboard">
              <p>Loading today's tasks...</p>
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="empty-dashboard">
              <CheckCircle />
              <p>No pending tasks for today.</p>
            </div>
          ) : (
            <div className="dashboard-task-list">
              {todayTasks.map((task) => (
                <div
                  className="dashboard-task"
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/task/${task.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/task/${task.id}`);
                    }
                  }}
                >
                  <div className="dashboard-task-check">
                    <Clock />
                  </div>

                  <div className="dashboard-task-info">
                    <strong>{task.title}</strong>
                    <span>{task.dueTime || "No time set"}</span>
                  </div>

                  <span
                    className={`priority-badge priority-${task.priority}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productivity */}
        <div className="dashboard-card productivity-card">
          <div className="card-header">
            <div>
              <h2>Productivity</h2>
              <p>Your task completion rate.</p>
            </div>
          </div>

          <div className="productivity-content">
            <div className="productivity-circle">
              <span>{isLoading ? "..." : `${productivity}%`}</span>
            </div>

            <h3>
              {isLoading
                ? "Loading statistics..."
                : `${statistics.completed} of ${statistics.total} tasks completed`}
            </h3>

            <p>
              Keep going! Complete your pending tasks to improve
              your productivity.
            </p>

            {!isLoading && (
              <p>
                In progress: {statistics.inProgress} task(s)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
