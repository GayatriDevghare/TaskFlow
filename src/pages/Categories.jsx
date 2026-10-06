
import { useMemo, useState } from "react";
import {
  Tags,
  CheckCircle,
  Clock,
  ListCheck,
  ArrowRight,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { useTasks } from "../context/TaskContext";

function Categories() {
  const {
    tasks,
    tasksLoading,
  } = useTasks();

  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Calculate category statistics from API-backed tasks.
  const categories = useMemo(() => {
    const categoryMap = {};

    tasks.forEach((task) => {
      const categoryName = (
        task.category || "Other"
      ).trim() || "Other";

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          total: 0,
          completed: 0,
          pending: 0,
        };
      }

      categoryMap[categoryName].total += 1;

      if (
        task.status === "completed" ||
        task.completed
      ) {
        categoryMap[categoryName].completed += 1;
      } else {
        categoryMap[categoryName].pending += 1;
      }
    });

    return Object.values(categoryMap).sort(
      (a, b) => b.total - a.total
    );
  }, [tasks]);

  const totalCategories = categories.length;
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "completed" ||
      task.completed
  ).length;

  const selectedTasks = selectedCategory
    ? tasks.filter(
        (task) =>
          (task.category || "Other").trim() ===
          selectedCategory
      )
    : [];

  const getCompletionPercentage = (
    completed,
    total
  ) => {
    if (total === 0) return 0;

    return Math.round((completed / total) * 100);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory((current) =>
      current === categoryName ? null : categoryName
    );
  };

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="categories-header">
        <div>
          <h1>Categories</h1>

          <p>
            Organize and track your tasks by category.
          </p>
        </div>

        <div className="categories-header-icon">
          <Tags />
        </div>
      </div>

      {/* Loading */}
      {tasksLoading ? (
        <div className="categories-empty">
          <div className="categories-empty-icon">
            <Tags />
          </div>

          <h2>Loading categories...</h2>

          <p>
            Fetching your tasks from the database.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="category-summary">
            <div className="category-summary-card">
              <div className="category-summary-icon">
                <Tags />
              </div>

              <div>
                <span>Total Categories</span>
                <strong>{totalCategories}</strong>
              </div>
            </div>

            <div className="category-summary-card">
              <div className="category-summary-icon">
                <ListCheck />
              </div>

              <div>
                <span>Total Tasks</span>
                <strong>{totalTasks}</strong>
              </div>
            </div>

            <div className="category-summary-card">
              <div className="category-summary-icon">
                <CheckCircle />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedTasks}</strong>
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.length === 0 ? (
            <div className="categories-empty">
              <div className="categories-empty-icon">
                <Tags />
              </div>

              <h2>No categories yet</h2>

              <p>
                Create a task with a category and it
                will appear here.
              </p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => {
                const completionPercentage =
                  getCompletionPercentage(
                    category.completed,
                    category.total
                  );

                const isSelected =
                  selectedCategory === category.name;

                return (
                  <div
                    className={
                      isSelected
                        ? "category-card selected"
                        : "category-card"
                    }
                    key={category.name}
                    onClick={() =>
                      handleCategoryClick(category.name)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        handleCategoryClick(category.name);
                      }
                    }}
                  >
                    <div className="category-card-top">
                      <div className="category-card-icon">
                        <Tags />
                      </div>

                      <div className="category-card-title">
                        <h2>{category.name}</h2>

                        <span>
                          {category.total}{" "}
                          {category.total === 1
                            ? "task"
                            : "tasks"}
                        </span>
                      </div>

                      <ArrowRight className="category-arrow" />
                    </div>

                    <div className="category-progress-section">
                      <div className="category-progress-label">
                        <span>Completion</span>

                        <strong>
                          {completionPercentage}%
                        </strong>
                      </div>

                      <div className="category-progress">
                        <div
                          className="category-progress-fill"
                          style={{
                            width: `${completionPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="category-card-stats">
                      <div>
                        <CheckCircle />

                        <span>Completed</span>

                        <strong>
                          {category.completed}
                        </strong>
                      </div>

                      <div>
                        <Clock />

                        <span>Pending</span>

                        <strong>
                          {category.pending}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Category Tasks */}
          {selectedCategory && (
            <div className="selected-category-section">
              <div className="selected-category-header">
                <div>
                  <h2>
                    {selectedCategory} Tasks
                  </h2>

                  <p>
                    Tasks belonging to this category.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setSelectedCategory(null)}
                >
                  Close
                </button>
              </div>

              {selectedTasks.length === 0 ? (
                <div className="categories-empty">
                  <p>
                    No tasks found in this category.
                  </p>
                </div>
              ) : (
                <div className="category-task-list">
                  {selectedTasks.map((task) => {
                    const isCompleted =
                      task.status === "completed" ||
                      task.completed;

                    return (
                      <div
                        className={
                          isCompleted
                            ? "category-task completed"
                            : "category-task"
                        }
                        key={task.id}
                      >
                        <div className="category-task-status">
                          {isCompleted ? (
                            <CheckCircle />
                          ) : (
                            <Clock />
                          )}
                        </div>

                        <div className="category-task-content">
                          <h3>{task.title}</h3>

                          {task.description && (
                            <p>{task.description}</p>
                          )}

                          <div className="category-task-meta">
                            <span
                              className={`priority-badge priority-${
                                task.priority || "medium"
                              }`}
                            >
                              {task.priority || "medium"}
                            </span>

                            {task.dueDate && (
                              <span>
                                📅 {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          className="category-task-view"
                          onClick={() =>
                            navigate(`/task/${task.id}`)
                          }
                          title="View task"
                          aria-label={`View ${task.title}`}
                        >
                          <ArrowRight />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Categories;
