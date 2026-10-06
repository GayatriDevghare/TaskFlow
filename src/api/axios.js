import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT access token to protected requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taskflow_access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh the access token when it expires.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("accounts/login/") &&
      !originalRequest.url?.includes("accounts/register/") &&
      !originalRequest.url?.includes("accounts/token/refresh/")
    ) {
      const refresh = localStorage.getItem("taskflow_refresh");

      if (!refresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/accounts/token/refresh/",
          { refresh }
        );

        const newAccess = response.data.access;

        localStorage.setItem("taskflow_access", newAccess);

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("taskflow_access");
        localStorage.removeItem("taskflow_refresh");
        localStorage.removeItem("taskflow_user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;