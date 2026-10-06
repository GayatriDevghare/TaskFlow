
import { useMemo, useState } from "react";
import {
  Plus,
  Trash,
  CheckCircle,
  Circle,
  Search,
  Funnel,
  ArrowDownUp,
  Pencil,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { useTasks } from "../context/TaskContext";

function Tasks() {
  const {
    tasks = [],
    tasksLoading = false,
    deleteTask,
    toggleTask,
  } = useTasks();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPriorityClass = (priority) => {
    return `priority-${priority || "low"}`;
  };

  // Normalize status because completed tasks may use either
  // the status field or the completed boolean.
  const isTaskCompleted = (task) => {
    return task.status === "completed" || task.completed === true;
  };

  // Get unique categories from existing tasks.
  const categories = useMemo(() => {
    return [
      ...new Set(
        tasks
          .map((task) => task.category)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  // Search, filter, and sort tasks.
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search by title, description, or category.
    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((task) => {
        return (
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search)
        );
      });
    }

    // Filter by status.
    if (statusFilter !== "all") {
      result = result.filter((task) => {
        if (statusFilter === "completed") {
          return isTaskCompleted(task);
        }

        if (statusFilter === "pending") {
          return !isTaskCompleted(task) && task.status === "todo";
        }

        if (statusFilter === "in-progress") {
          return task.status === "in-progress";
        }

        return task.status === statusFilter;
      });
    }

    // Filter by priority.
    if (priorityFilter !== "all") {
      result = result.filter(
        (task) => task.priority === priorityFilter
      );
    }

    // Filter by category.
    if (categoryFilter !== "all") {
      result = result.filter(
        (task) => task.category === categoryFilter
      );
    }

    // Sort without mutating the original task list.
    result.sort((a, b) => {
      if (sortBy === "newest" || sortBy === "oldest") {
        const aDate = a.created_at
          ? new Date(a.created_at).getTime()
          : Number(a.id) || 0;

        const bDate = b.created_at
          ? new Date(b.created_at).getTime()
          : Number(b.id) || 0;

        return sortBy === "newest"
          ? bDate - aDate
          : aDate - bDate;
      }

      if (sortBy === "priority") {
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        return (
          (priorityOrder[a.priority] || 4) -
          (priorityOrder[b.priority] || 4)
        );
      }

      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      }

      return 0;
    });

    return result;
  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSortBy("newest");
    setError("");
    setSuccess("");
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "newest";

  // Prevent duplicate actions on the same task.
  const isTaskBusy = (taskId) => Boolean(actionLoading[taskId]);

  // Toggle a task's completion status.
  const handleToggleTask = async (task) => {
    if (isTaskBusy(task.id)) return;

    setError("");
    setSuccess("");
    setActionLoading((previous) => ({
      ...previous,
      [task.id]: true,
    }));

    try {
      await toggleTask(task.id);
      setSuccess(
        isTaskCompleted(task)
          ? "Task marked as pending."
          : "Task marked as completed."
      );
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Unable to update this task. Please try again.");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [task.id]: false,
      }));
    }
  };

  // Delete a task.
  const handleDeleteTask = async (task) => {
    if (isTaskBusy(task.id)) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setActionLoading((previous) => ({
      ...previous,
      [task.id]: true,
    }));

    try {
      await deleteTask(task.id);
      setSuccess("Task deleted successfully.");
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Unable to delete this task. Please try again.");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [task.id]: false,
      }));
    }
  };

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p>Manage all your tasks in one place.</p>
        </div>

        <button
          className="primary-button add-task-button"
          onClick={() => navigate("/add-task")}
          type="button"
        >
          <Plus />
          Add Task
        </button>
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

      {/* Search */}
      <div className="task-toolbar">
        <div className="task-search">
          <Search />

          <input
            type="search"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-label">
          <Funnel />
          Filters
        </div>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <div className="filter-group">
          <label htmlFor="task-status-filter">Status</label>

          <select
            id="task-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="task-priority-filter">Priority</label>

          <select
            id="task-priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="task-category-filter">Category</label>

          <select
            id="task-category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="task-sort-filter">Sort By</label>

          <div className="sort-select">
            <ArrowDownUp />

            <select
              id="task-sort-filter"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        {filtersActive && (
          <button
            className="clear-filter-button"
            onClick={clearFilters}
            type="button"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task count */}
      <div className="task-summary">
        <strong>{tasksLoading ? "..." : filteredTasks.length}</strong>

        <span>
          {filteredTasks.length === 1 ? " task" : " tasks"}
        </span>

        {!tasksLoading && filteredTasks.length !== tasks.length && (
          <span> of {tasks.length}</span>
        )}
      </div>

      {/* Tasks list */}
      <div className="tasks-list">
        {tasksLoading ? (
          <div className="empty-tasks" role="status">
            <p>Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-tasks">
            <div className="empty-icon">
              <CheckCircle />
            </div>

            <h2>
              {tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks"}
            </h2>

            <p>
              {tasks.length === 0
                ? "Create your first task to get started."
                : "Try changing your search or filters."}
            </p>

            {tasks.length === 0 ? (
              <button
                className="primary-button"
                onClick={() => navigate("/add-task")}
                type="button"
              >
                <Plus />
                Create Task
              </button>
            ) : (
              <button
                className="secondary-button"
                onClick={clearFilters}
                type="button"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completed = isTaskCompleted(task);
            const busy = isTaskBusy(task.id);

            return (
              <div
                className={
                  completed
                    ? "task-card completed-task"
                    : "task-card"
                }
                key={task.id}
              >
                {/* Completion checkbox */}
                <button
                  className="task-check-button"
                  onClick={() => handleToggleTask(task)}
                  title={
                    completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                  aria-label={
                    completed
                      ? `Mark ${task.title} as pending`
                      : `Mark ${task.title} as completed`
                  }
                  disabled={busy}
                  type="button"
                >
                  {completed ? <CheckCircle /> : <Circle />}
                </button>

                {/* Task content */}
                <div className="task-content">
                  <div className="task-title-row">
                    <h3
                      className="clickable-task-title"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/task/${task.id}`)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          navigate(`/task/${task.id}`);
                        }
                      }}
                    >
                      {task.title}
                    </h3>

                    <span
                      className={`priority-badge ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority || "low"}
                    </span>
                  </div>

                  {task.description && (
                    <p className="task-description">
                      {task.description}
                    </p>
                  )}

                  <div className="task-meta">
                    {task.category && (
                      <span className="category-badge">
                        {task.category}
                      </span>
                    )}

                    {task.dueDate && (
                      <span>📅 {task.dueDate}</span>
                    )}

                    {task.dueTime && (
                      <span>🕐 {task.dueTime}</span>
                    )}

                    <span>
                      Status:{" "}
                      {completed
                        ? "Completed"
                        : task.status === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                    </span>
                  </div>

                  {busy && (
                    <small role="status">Updating task...</small>
                  )}
                </div>

                {/* Task actions */}
                <div className="task-actions">
                  <button
                    className="edit-task-button"
                    onClick={() => navigate(`/edit-task/${task.id}`)}
                    title="Edit task"
                    aria-label={`Edit ${task.title}`}
                    disabled={busy}
                    type="button"
                  >
                    <Pencil />
                  </button>

                  <button
                    className="delete-task-button"
                    onClick={() => handleDeleteTask(task)}
                    title="Delete task"
                    aria-label={`Delete ${task.title}`}
                    disabled={busy}
                    type="button"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Tasks;
