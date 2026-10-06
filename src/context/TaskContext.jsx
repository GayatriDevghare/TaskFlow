
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import api from "../api/axios";

const TaskContext = createContext();

// Convert Django task data into the format used by the React UI.
const normalizeTask = (task) => ({
  ...task,
  dueDate: task.due_date
    ? String(task.due_date).slice(0, 10)
    : "",
  dueTime: task.due_time || "",
  category: task.category_name || "",
  completed: task.status === "completed",
});

// Convert API list responses into arrays.
const getList = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

// Convert frontend field names to Django field names.
const toApiPayload = (task) => {
  const payload = {};

  const allowedFields = [
    "title",
    "description",
    "priority",
    "status",
    "category",
    "dueDate",
    "dueTime",
  ];

  allowedFields.forEach((field) => {
    if (task[field] !== undefined) {
      payload[field] = task[field];
    }
  });

  if (payload.dueDate !== undefined) {
  payload.due_date = payload.dueDate
    ? String(payload.dueDate).slice(0, 10)
    : null;

  delete payload.dueDate;
}

  if (payload.dueTime !== undefined) {
    payload.due_time = payload.dueTime;
    delete payload.dueTime;
  }

  delete payload.category;

  return payload;
};

export function TaskProvider({ children }) {
  const { user, authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Load tasks whenever the authenticated user changes.
  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      if (authLoading) return;

      if (!user) {
        setTasks([]);
        setTasksLoading(false);
        return;
      }

      setTasksLoading(true);

      try {
        const response = await api.get("tasks/");

        if (!cancelled) {
          setTasks(getList(response.data).map(normalizeTask));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load tasks:", error);
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, authLoading]);

  // Find a category by name, creating it if it doesn't exist.
  const getCategoryId = async (categoryName) => {
    if (!categoryName) return null;

    const response = await api.get("tasks/categories/");
    const categories = getList(response.data);

    const existingCategory = categories.find(
      (category) =>
        category.name.toLowerCase() ===
        categoryName.trim().toLowerCase()
    );

    if (existingCategory) {
      return existingCategory.id;
    }

    const createdResponse = await api.post(
      "tasks/categories/",
      {
        name: categoryName.trim(),
        color: "#6366f1",
      }
    );

    return createdResponse.data.id;
  };

  // ADD TASK
  const addTask = async (task) => {
    const categoryId = await getCategoryId(task.category);

    const payload = {
      ...toApiPayload(task),
      status: task.status || "todo",
      category: categoryId,
    };

    const response = await api.post("tasks/", payload);
    const newTask = normalizeTask(response.data);

    setTasks((previous) => [...previous, newTask]);

    return newTask;
  };

  // UPDATE TASK
  const updateTask = async (id, updatedTask) => {
    const payload = toApiPayload(updatedTask);

    if (updatedTask.category !== undefined) {
      payload.category = await getCategoryId(
        updatedTask.category
      );
    }

    const response = await api.patch(`tasks/${id}/`, payload);
    const savedTask = normalizeTask(response.data);

    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? savedTask : task
      )
    );

    return savedTask;
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    await api.delete(`tasks/${id}/`);

    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );
  };

  // TOGGLE COMPLETION
  const toggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const newStatus =
      task.status === "completed" ? "todo" : "completed";

    await updateTask(id, {
      status: newStatus,
    });
  };

  // DELETE ALL TASKS belonging to the current user.
  const clearTasks = async () => {
    await Promise.all(
      tasks.map((task) =>
        api.delete(`tasks/${task.id}/`)
      )
    );

    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        tasksLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        clearTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}