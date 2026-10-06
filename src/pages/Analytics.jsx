
import { useMemo } from "react";
import {
  BarChart,
  CheckCircle,
  Clock,
  ExclamationCircle,
  ListCheck,
} from "react-bootstrap-icons";

import { useTasks } from "../context/TaskContext";

function Analytics() {
  const { tasks, tasksLoading } = useTasks();

  // Use the local calendar date.
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const analytics = useMemo(() => {
    const isCompleted = (task) =>
      task.status === "completed" || task.completed === true;

    const total = tasks.length;

    const completed = tasks.filter(isCompleted).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const pending = tasks.filter(
      (task) =>
        !isCompleted(task) &&
        task.status !== "in-progress"
    ).length;

    const overdue = tasks.filter(
      (task) =>
        !isCompleted(task) &&
        task.dueDate &&
        task.dueDate < today
    ).length;

    const completionRate =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const priorities = {
      high: tasks.filter(
        (task) => task.priority === "high"
      ).length,

      medium: tasks.filter(
        (task) => task.priority === "medium"
      ).length,

      low: tasks.filter(
        (task) => task.priority === "low"
      ).length,
    };

    const categories = {};

    tasks.forEach((task) => {
      const category = task.category || "Other";
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate,
      priorities,
      categories,
    };
  }, [tasks, today]);

  const getPercentage = (value) => {
    if (analytics.total === 0) return 0;

    return Math.round((value / analytics.total) * 100);
  };

  if (tasksLoading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div>
            <h1>Analytics</h1>
            <p>Loading your task analytics...</p>
          </div>
          <div className="analytics-icon">
            <BarChart />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p>Track your productivity and task progress.</p>
        </div>

        <div className="analytics-icon">
          <BarChart />
        </div>
      </div>

      {/* Statistics */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <ListCheck />
          </div>
          <div>
            <span>Total Tasks</span>
            <strong>{analytics.total}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <CheckCircle />
          </div>
          <div>
            <span>Completed</span>
            <strong>{analytics.completed}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <Clock />
          </div>
          <div>
            <span>Pending</span>
            <strong>{analytics.pending}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">
            <ExclamationCircle />
          </div>
          <div>
            <span>Overdue</span>
            <strong>{analytics.overdue}</strong>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="analytics-card completion-card">
        <div className="analytics-card-header">
          <div>
            <h2>Completion Rate</h2>
            <p>Percentage of tasks you have completed.</p>
          </div>

          <strong className="completion-percentage">
            {analytics.completionRate}%
          </strong>
        </div>

        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Task completion rate"
          aria-valuenow={analytics.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-fill"
            style={{
              width: `${analytics.completionRate}%`,
            }}
          />
        </div>

        <p className="progress-text">
          {analytics.completed} of {analytics.total} tasks completed
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Priority Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h2>Priority Distribution</h2>
              <p>Tasks grouped by priority.</p>
            </div>
          </div>

          <div className="analytics-bars">
            {[
              { label: "High", key: "high", className: "high-bar" },
              { label: "Medium", key: "medium", className: "medium-bar" },
              { label: "Low", key: "low", className: "low-bar" },
            ].map((item) => (
              <div className="analytics-bar-item" key={item.key}>
                <div className="bar-label">
                  <span>{item.label}</span>
                  <strong>{analytics.priorities[item.key]}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className={`bar-fill ${item.className}`}
                    style={{
                      width: `${getPercentage(
                        analytics.priorities[item.key]
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <h2>Categories</h2>
              <p>Tasks grouped by category.</p>
            </div>
          </div>

          {Object.keys(analytics.categories).length === 0 ? (
            <div className="analytics-empty">
              No category data available.
            </div>
          ) : (
            <div className="category-analytics">
              {Object.entries(analytics.categories).map(
                ([category, count]) => (
                  <div
                    className="category-analytics-item"
                    key={category}
                  >
                    <div className="category-name">
                      <span className="category-dot" />
                      <span>{category}</span>
                    </div>

                    <strong>{count}</strong>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Productivity Summary */}
      <div className="analytics-card productivity-summary">
        <div className="analytics-card-header">
          <div>
            <h2>Productivity Summary</h2>
            <p>A quick overview of your current workload.</p>
          </div>
        </div>

        <div className="summary-message">
          {analytics.total === 0 ? (
            <p>
              You don't have any tasks yet. Create a task to start
              tracking your productivity.
            </p>
          ) : analytics.completionRate === 100 ? (
            <p>
              🎉 All your tasks are completed. Great work!
            </p>
          ) : analytics.overdue > 0 ? (
            <p>
              You have {analytics.overdue} overdue{" "}
              {analytics.overdue === 1 ? "task" : "tasks"} that
              need attention.
            </p>
          ) : (
            <p>
              You have completed {analytics.completionRate}% of
              your tasks. Keep making progress!
            </p>
          )}

          {analytics.total > 0 && (
            <p>
              In progress: {analytics.inProgress} task(s).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
