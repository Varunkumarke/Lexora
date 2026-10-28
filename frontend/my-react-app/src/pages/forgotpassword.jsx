import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import SidePanel from "../components/SidePanel";
import { LoginArt } from "../components/public/AuthArt";
import { Alert, Field } from "../components/public/Fields";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, 
        { email },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message || "Reset link sent to your email");
        setEmail("");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      
      if (err.response) {
        setError(err.response.data.message || "Something went wrong");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login" sidePanel={<SidePanel><LoginArt title="Lost for words? It happens." text="Enter your email and we’ll send you a link to set a new password." /></SidePanel>}>
      <div className="ls-auth-heading">
        <h1>Reset your password</h1>
        <p>Enter the email you registered with.</p>
      </div>

      {message && <Alert kind="success">{message}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <form className="ls-form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button className="ls-btn ls-btn-primary ls-btn-block" type="submit" disabled={loading}>
          {loading ? <><span className="ls-spin" /> Sending…</> : <>Send reset link <Send size={16} /></>}
        </button>
      </form>

      <p className="ls-switch"><Link to="/login"><ArrowLeft size={14} /> Back to login</Link></p>
    </AuthLayout>
  );
};

export default ForgotPassword;
