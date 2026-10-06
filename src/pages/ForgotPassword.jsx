import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeSlash,
  CheckCircle
} from "react-bootstrap-icons";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  const handleResetPassword = (e) => {

    e.preventDefault();

    // Validate email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }


    // Get registered users
    const existingUsers = JSON.parse(
      localStorage.getItem(
        "taskflow_users"
      ) || "[]"
    );


    // Find account
    const userIndex = existingUsers.findIndex(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
    );


    if (userIndex === -1) {
      alert(
        "No account found with this email address."
      );
      return;
    }


    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!])[A-Za-z\d@#$%!]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      alert(
        "Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
      );
      return;
    }


    // Confirm password
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }


    // Update password
    existingUsers[userIndex].password =
      newPassword;


    // Save updated users
    localStorage.setItem(
      "taskflow_users",
      JSON.stringify(existingUsers)
    );


    alert(
      "Password reset successfully! Please sign in."
    );


    // Go to login
    navigate("/login");

  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">

          <div className="auth-logo-icon">
            ✓
          </div>

          <span>
            TaskFlow
          </span>

        </div>


        {/* HEADER */}

        <div className="auth-header">

          <h1>
            Reset your password
          </h1>

          <p>
            Enter your registered email and
            create a new password.
          </p>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleResetPassword}
        >

          {/* EMAIL */}

          <div className="auth-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your registered email"
            />

          </div>


          {/* NEW PASSWORD */}

          <div className="auth-form-group">

            <label>
              New Password
            </label>

            <div className="password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Create a new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword ? (
                  <EyeSlash />
                ) : (
                  <Eye />
                )}

              </button>

            </div>

            <small className="password-hint">
              At least 8 characters, including
              uppercase, lowercase, number and
              special character.
            </small>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="auth-form-group">

            <label>
              Confirm New Password
            </label>

            <div className="password-input">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm your new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >

                {showConfirmPassword ? (
                  <EyeSlash />
                ) : (
                  <Eye />
                )}

              </button>

            </div>

          </div>


          {/* RESET BUTTON */}

          <button
            type="submit"
            className="auth-button"
          >
            Reset Password
          </button>

        </form>


        {/* INFO */}

        <div className="auth-demo">

          <CheckCircle />

          <span>
            Your password will be updated
            for this prototype.
          </span>

        </div>


        {/* LOGIN */}

        <p className="auth-footer">

          Remember your password?{" "}

          <Link to="/login">
            Sign In
          </Link>

        </p>

      </div>

    </div>

  );
}

export default ForgotPassword;