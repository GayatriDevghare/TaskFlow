
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeSlash,
  CheckCircle,
} from "react-bootstrap-icons";

import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@#$%!]/.test(password),
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate name
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Validate email
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!])[A-Za-z\d@#$%!]{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@#$%!)."
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Register the user through the Django API.
      await api.post("accounts/register/", {
        username: normalizedEmail,
        first_name: name.trim(),
        email: normalizedEmail,
        password,
      });

      // Save initial UI preferences only.
      // Account details and passwords are managed by Django.
      localStorage.setItem(
        "taskflow_profile",
        JSON.stringify({
          profileName: name.trim(),
          email: normalizedEmail,
          notifications: true,
          darkMode: false,
        })
      );

      alert("Registration successful! Please log in.");

      navigate("/login", { replace: true });
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        if (data.email) {
          setError(
            "This email address is already registered or invalid."
          );
        } else if (data.username) {
          setError(
            "An account with this email already exists."
          );
        } else if (data.password) {
          setError(
            Array.isArray(data.password)
              ? data.password[0]
              : String(data.password)
          );
        } else {
          const firstError = Object.values(data).flat()[0];

          setError(
            String(firstError || "Registration failed. Please try again.")
          );
        }
      } else {
        setError(
          "Cannot connect to the server. Please make sure Django is running."
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
          <h1>Create your account</h1>
          <p>Start organizing your tasks today.</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* REGISTRATION FORM */}
        <form onSubmit={handleRegister}>
          {/* NAME */}
          <div className="auth-form-group">
            <label htmlFor="register-name">Full Name</label>

            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="auth-form-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="auth-form-group">
            <label htmlFor="register-password">Password</label>

            <div className="password-input">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Create a password"
                autoComplete="new-password"
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

            <small className="password-hint">
              Password must contain at least 8 characters,
              including one uppercase letter, one lowercase
              letter, one number, and one special character.
            </small>

            {/* LIVE PASSWORD RULES */}
            <div className="password-rules">
              <p className={passwordRules.minLength ? "valid" : ""}>
                {passwordRules.minLength ? "✓" : "✗"} At least 8 characters
              </p>

              <p className={passwordRules.uppercase ? "valid" : ""}>
                {passwordRules.uppercase ? "✓" : "✗"} One uppercase letter
              </p>

              <p className={passwordRules.lowercase ? "valid" : ""}>
                {passwordRules.lowercase ? "✓" : "✗"} One lowercase letter
              </p>

              <p className={passwordRules.number ? "valid" : ""}>
                {passwordRules.number ? "✓" : "✗"} One number
              </p>

              <p className={passwordRules.special ? "valid" : ""}>
                {passwordRules.special ? "✓" : "✗"} One special character
              </p>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="auth-form-group">
            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <div className="password-input">
              <input
                id="register-confirm-password"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* INFORMATION */}
        <div className="auth-demo">
          <CheckCircle />
          <span>
            Your account is securely managed by the TaskFlow
            backend.
          </span>
        </div>

        {/* LOGIN LINK */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;