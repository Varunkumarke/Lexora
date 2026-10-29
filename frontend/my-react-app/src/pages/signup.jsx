// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ArrowRight, Lock, Mail, User } from "lucide-react";
// import AuthLayout from "../components/AuthLayout";
// import SidePanel from "../components/SidePanel";
// import { SignupArt } from "../components/public/AuthArt";
// import { Alert, Field, GoogleButton, PasswordField } from "../components/public/Fields";
// import { register } from "../services/authservice";
// import { isValidEmail } from "../utils/auth";
// import { getPasswordStrength, getStrengthLabel } from "../utils/passwordStrength";

// // The backend expects exactly these role values.
// const ROLES = [
//   { value: "user", label: "Student", hint: "Learn and practise" },
//   { value: "admin", label: "Admin", hint: "Manage content" },
// ];

// const STRENGTH_TONE = { Weak: "weak", Good: "good", Strong: "strong" };

// const Signup = () => {
//   const navigate = useNavigate();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [role, setRole] = useState("user");
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const strength = getPasswordStrength(password);
//   const { text: strengthText } = getStrengthLabel(strength);

//   const validate = () => {
//     const errs = {};
//     if (!name.trim()) errs.name = "Please enter your name.";
//     if (!isValidEmail(email)) errs.email = "Please enter a valid email address.";
//     if (password.length < 8) errs.password = "Use at least 8 characters.";
//     if (password !== confirmPassword) errs.confirm = "Your passwords do not match.";
//     setFieldErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     if (!validate()) return;

//     setIsSubmitting(true);
//     try {
//       // Existing contract: POST /register { name, email, password, role }.
//       await register({ name: name.trim(), email, password, role });
//       navigate("/login", { state: { message: "Account created successfully! Please log in to continue." } });
//     } catch (err) {
//       setError(err.message || "Signup failed. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <AuthLayout variant="signup" sidePanel={<SidePanel><SignupArt /></SidePanel>}>
//       <div className="ls-auth-heading">
//         <h1>Create your account</h1>
//         <p>Start building your language skills today.</p>
//       </div>

//       {error && <Alert kind="error">{error}</Alert>}

//       <GoogleButton>Sign up with Google</GoogleButton>
//       <div className="ls-divider"><span>or sign up with email</span></div>

//       <form className="ls-form ls-form-compact" onSubmit={handleSubmit} noValidate>
//         <div className="ls-form-2">
//           <Field label="Full name" icon={User} name="name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
//           <Field label="Email address" icon={Mail} type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
//         </div>

//         <div className="ls-form-2">
//           <PasswordField label="Password" icon={Lock} name="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
//           <PasswordField label="Confirm password" icon={Lock} name="confirmPassword" autoComplete="new-password" placeholder="Repeat password" toggleLabel="confirmation password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={fieldErrors.confirm} />
//         </div>

//         <div className="ls-strength" aria-live="polite">
//           <div className={`ls-strength-bar ${password ? STRENGTH_TONE[strengthText] : ""}`}>
//             <i style={{ width: `${password ? Math.max(strength, 10) : 0}%` }} />
//           </div>
//           <span>{password ? <>Password strength: <b>{strengthText}</b></> : "Use 8+ characters with capitals, numbers and symbols."}</span>
//         </div>

//         <div className="ls-roles" role="radiogroup" aria-labelledby="signup-role-label">
//           <span className="ls-roles-label" id="signup-role-label">Account type</span>
//           {ROLES.map((r) => (
//             <label key={r.value} className={role === r.value ? "is-active" : ""}>
//               <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
//               <span><b>{r.label}</b><small>{r.hint}</small></span>
//             </label>
//           ))}
//         </div>

//         <button className="ls-btn ls-btn-primary ls-btn-block" type="submit" disabled={isSubmitting}>
//           {isSubmitting ? <><span className="ls-spin" /> Creating account…</> : <>Create account <ArrowRight size={17} /></>}
//         </button>
//       </form>

//       <p className="ls-switch">Already have an account? <Link to="/login">Log in</Link></p>
//     </AuthLayout>
//   );
// };

// export default Signup;



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import SidePanel from "../components/SidePanel";
import { SignupArt } from "../components/public/AuthArt";
import {
  Alert,
  Field,
  GoogleButton,
  PasswordField,
} from "../components/public/Fields";
// import { register } from "../services/authService";
import { register } from "../services/authservice";
import { isValidEmail } from "../utils/auth";
import {
  getPasswordStrength,
  getStrengthLabel,
} from "../utils/passwordStrength";

const STRENGTH_TONE = {
  Weak: "weak",
  Good: "good",
  Strong: "strong",
};

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);
  const { text: strengthText } = getStrengthLabel(strength);

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = "Please enter your name.";
    }

    if (!isValidEmail(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (password.length < 8) {
      errs.password = "Use at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errs.confirm = "Your passwords do not match.";
    }

    setFieldErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email,
        password,
        role: "user",
      });

      navigate("/login", {
        state: {
          message:
            "Account created successfully! Please log in to continue.",
        },
      });
    } catch (err) {
      setError(
        err.message || "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      variant="signup"
      sidePanel={
        <SidePanel>
          <SignupArt />
        </SidePanel>
      }
    >
      <div className="ls-auth-heading">
        <h1>Create your account</h1>
        <p>Start building your language skills today.</p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <GoogleButton>Sign up with Google</GoogleButton>

      <div className="ls-divider">
        <span>or sign up with email</span>
      </div>

      <form
        className="ls-form ls-form-compact"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="ls-form-2">
          <Field
            label="Full name"
            icon={User}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

          <Field
            label="Email address"
            icon={Mail}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
        </div>

        <div className="ls-form-2">
          <PasswordField
            label="Password"
            icon={Lock}
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <PasswordField
            label="Confirm password"
            icon={Lock}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat password"
            toggleLabel="confirmation password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirm}
          />
        </div>

        <div className="ls-strength" aria-live="polite">
          <div
            className={`ls-strength-bar ${
              password ? STRENGTH_TONE[strengthText] : ""
            }`}
          >
            <i
              style={{
                width: `${
                  password ? Math.max(strength, 10) : 0
                }%`,
              }}
            />
          </div>

          <span>
            {password ? (
              <>
                Password strength: <b>{strengthText}</b>
              </>
            ) : (
              "Use 8+ characters with capitals, numbers and symbols."
            )}
          </span>
        </div>

        <button
          className="ls-btn ls-btn-primary ls-btn-block"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="ls-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <p className="ls-switch">
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;

