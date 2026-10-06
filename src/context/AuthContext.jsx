import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("taskflow_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("taskflow_access");

    if (!access) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    api
      .get("accounts/me/")
      .then((response) => {
        setUser(response.data);
        localStorage.setItem(
          "taskflow_user",
          JSON.stringify(response.data)
        );
      })
      .catch(() => {
        // The Axios interceptor handles token refresh.
        setUser(null);
        localStorage.removeItem("taskflow_user");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem("taskflow_access", tokens.access);
    localStorage.setItem("taskflow_refresh", tokens.refresh);
    localStorage.setItem("taskflow_user", JSON.stringify(userData));

    setUser(userData);
  };

  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) return null;

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        "taskflow_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const logout = () => {
    localStorage.removeItem("taskflow_access");
    localStorage.removeItem("taskflow_refresh");
    localStorage.removeItem("taskflow_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: !!user,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}