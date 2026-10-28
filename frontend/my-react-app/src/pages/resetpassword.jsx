import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import SidePanel from "../components/SidePanel";
import { LoginArt } from "../components/public/AuthArt";
import { Alert, PasswordField } from "../components/public/Fields";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // React Router hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract token from URL
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!token) {
      setError("Reset token is missing");
      return;
    }
    
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          token: token,
          newPassword: password
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 200) {
        setMessage("Password reset successful! Redirecting to login…");
        
        // Clear form
        setPassword("");
        setConfirmPassword("");
        
        // Wait 2 seconds then redirect
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Something went wrong");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login" sidePanel={<SidePanel><LoginArt title="A fresh start, one word at a time." text="Choose a strong new password and get back to learning." /></SidePanel>}>
      <div className="ls-auth-heading">
        <h1>Set a new password</h1>
        <p>Use at least 8 characters.</p>
      </div>

      {message && <Alert kind="success">{message}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <form className="ls-form" onSubmit={handleSubmit} noValidate>
        <PasswordField
          label="New password"
          icon={Lock}
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <PasswordField
          label="Confirm new password"
          icon={Lock}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          toggleLabel="confirmation password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        <button className="ls-btn ls-btn-primary ls-btn-block" type="submit" disabled={loading || !token}>
          {loading ? <><span className="ls-spin" /> Resetting…</> : "Reset password"}
        </button>
        {!token && <Alert kind="info">No reset token found. Please use the link from your email.</Alert>}
      </form>

      <p className="ls-switch"><Link to="/login"><ArrowLeft size={14} /> Back to login</Link></p>
    </AuthLayout>
  );
};

export default ResetPassword;
