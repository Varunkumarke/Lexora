import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import SidePanel from "../components/SidePanel";
import { LoginArt } from "../components/public/AuthArt";
import { Alert, Field, GoogleButton, PasswordField } from "../components/public/Fields";
import { login } from "../services/authservice";
import { getUser, isValidEmail, saveAuth } from "../utils/auth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const checkEmail = (v) => (isValidEmail(v) ? "" : "Please enter a valid email address.");
  const checkPassword = (v) => (v ? "" : "Please enter your password.");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const errs = { email: checkEmail(email), password: checkPassword(password) };
    setFieldErrors(errs);
    if (errs.email || errs.password) return;

    setIsSubmitting(true);
    try {
      // Existing contract: POST /login { email, password } -> { token, user }, role decides the dashboard.
      const data = await login({ email, password });
      saveAuth(data.token, data.user);
      const user = getUser();
      navigate(user?.role === "admin" ? "/dashboard" : "/user-dashboard", {
        state: { message: "Login successful! Welcome back." },
      });
    } catch (err) {
      setError(err.message || "Login failed. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login" sidePanel={<SidePanel><LoginArt /></SidePanel>}>
      <div className="ls-auth-heading">
        <h1>Welcome back</h1>
        <p>Sign in to continue your learning.</p>
      </div>

      {successMessage && <Alert kind="success">{successMessage}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <GoogleButton>Continue with Google</GoogleButton>
      <div className="ls-divider"><span>or sign in with email</span></div>

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
          onBlur={() => email && setFieldErrors((f) => ({ ...f, email: checkEmail(email) }))}
          error={fieldErrors.email}
        />
        <PasswordField
          label="Password"
          icon={Lock}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          right={<Link to="/forgot-password" className="ls-text-link">Forgot password?</Link>}
        />
        <button className="ls-btn ls-btn-primary ls-btn-block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><span className="ls-spin" /> Signing in…</> : <>Log in <ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="ls-switch">New to lexora? <Link to="/signup">Create an account</Link></p>
    </AuthLayout>
  );
}

export default Login;
