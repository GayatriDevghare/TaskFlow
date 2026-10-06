
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Eye,
  EyeSlash,
} from "react-bootstrap-icons";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Authenticate with Django and obtain JWT tokens.
      const response = await api.post("accounts/login/", {
        username: email.trim().toLowerCase(),
        password,
      });

      const tokens = response.data;

      if (!tokens.access || !tokens.refresh) {
        throw new Error("Authentication tokens were not returned.");
      }

      // Step 2: Save tokens so Axios can authorize API requests.
      localStorage.setItem("taskflow_access", tokens.access);
      localStorage.setItem("taskflow_refresh", tokens.refresh);

      // Step 3: Fetch the authenticated user's profile.
      const profileResponse = await api.get("accounts/me/");
      const userData = profileResponse.data;

      // Step 4: Update the React authentication context.
      login(userData, tokens);

      // Step 5: Keep the existing profile settings compatible.
      const existingProfile = JSON.parse(
        localStorage.getItem("taskflow_profile") || "{}"
      );

      localStorage.setItem(
        "taskflow_profile",
        JSON.stringify({
          ...existingProfile,
          profileName: userData.name,
          email: userData.email,
        })
      );

      // Step 6: Navigate to the dashboard.
      navigate("/", { replace: true });
    } catch (err) {
      // Remove any incomplete session if login fails.
      localStorage.removeItem("taskflow_access");
      localStorage.removeItem("taskflow_refresh");
      localStorage.removeItem("taskflow_user");

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 400) {
        setError("Please check your email and password.");
      } else if (!err.response) {
        setError(
          "Cannot connect to the server. Please make sure Django is running."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LOGO */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <span>TaskFlow</span>
        </div>

        {/* HEADER */}
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>
            Sign in to continue managing your tasks.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className="auth-form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="auth-form-group">
            <div className="auth-label-row">
              <label htmlFor="login-password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="password-input">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* INFORMATION */}
        <div className="auth-demo">
          <CheckCircle />
          <span>
            Sign in with your registered TaskFlow account.
          </span>
        </div>

        {/* REGISTER LINK */}
        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;