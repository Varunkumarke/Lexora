import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from "lucide-react";
import { googleLogin } from "../../services/authService";
import { saveAuth } from "../../utils/auth";

export function Alert({ kind = "error", children }) {
  const Icon =
    kind === "success" ? CheckCircle2 : kind === "info" ? Info : AlertCircle;

  return (
    <div
      className={`ls-alert ls-alert-${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Field({
  label,
  icon: Icon,
  error,
  hint,
  right,
  children,
  id,
  ...input
}) {
  const auto = useId();
  const fid = id || auto;
  const eid = `${fid}-err`;

  return (
    <div className={`ls-field${error ? " has-error" : ""}`}>
      <div className="ls-label-row">
        <label htmlFor={fid}>{label}</label>
        {right}
      </div>

      <div className="ls-input">
        {Icon && (
          <Icon className="ls-input-icon" size={17} aria-hidden="true" />
        )}
        {children ? (
          children(fid, eid)
        ) : (
          <input
            id={fid}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? eid : undefined}
            {...input}
          />
        )}
      </div>

      {error && (
        <p className="ls-field-error" id={eid}>
          {error}
        </p>
      )}
      {!error && hint && <p className="ls-field-hint">{hint}</p>}
    </div>
  );
}

export function PasswordField({
  label,
  icon,
  error,
  hint,
  right,
  toggleLabel = "password",
  ...input
}) {
  const [show, setShow] = useState(false);

  return (
    <Field label={label} icon={icon} error={error} hint={hint} right={right}>
      {(fid, eid) => (
        <>
          <input
            id={fid}
            type={show ? "text" : "password"}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? eid : undefined}
            {...input}
          />
          <button
            type="button"
            className="ls-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={`${show ? "Hide" : "Show"} ${toggleLabel}`}
            aria-pressed={show}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </>
      )}
    </Field>
  );
}

export function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// export function GoogleButton({ children }) {
//   const buttonRef = useRef(null);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//     if (!clientId) {
//       setError("Google sign-in is not configured. Check your frontend .env file.");
//       return undefined;
//     }

//     let cancelled = false;

//     const initializeGoogle = () => {
//       if (
//         cancelled ||
//         !buttonRef.current ||
//         !window.google?.accounts?.id
//       ) {
//         return;
//       }

//       buttonRef.current.innerHTML = "";

//       window.google.accounts.id.initialize({
//         client_id: clientId,
//         callback: async (response) => {
//           if (!response.credential) {
//             setError("Google did not return a credential. Please try again.");
//             return;
//           }

//           setError("");
//           setIsLoading(true);

//           try {
//             const data = await googleLogin({
//               credential: response.credential,
//             });

//             saveAuth(data.token, data.user);

//             window.location.assign(
//               data.user?.role === "admin"
//                 ? "/dashboard"
//                 : "/user-dashboard"
//             );
//           } catch (err) {
//             setError(err.message || "Google sign-in failed. Please try again.");
//           } finally {
//             setIsLoading(false);
//           }
//         },
//       });

//       window.google.accounts.id.renderButton(buttonRef.current, {
//         type: "standard",
//         theme: "outline",
//         size: "large",
//         text: children?.toLowerCase().includes("sign up")
//           ? "signup_with"
//           : "signin_with",
//         shape: "rectangular",
//         width: 320,
//       });
//     };

//     if (window.google?.accounts?.id) {
//       initializeGoogle();
//     } else {
//       let script = document.querySelector(
//         'script[src="https://accounts.google.com/gsi/client"]'
//       );

//       if (!script) {
//         script = document.createElement("script");
//         script.src = "https://accounts.google.com/gsi/client";
//         script.async = true;
//         script.defer = true;
//         script.onload = initializeGoogle;
//         script.onerror = () => {
//           if (!cancelled) {
//             setError("Could not load Google sign-in. Please try again.");
//           }
//         };
//         document.head.appendChild(script);
//       } else {
//         script.addEventListener("load", initializeGoogle);
//         if (window.google?.accounts?.id) initializeGoogle();
//       }
//     }

//     return () => {
//       cancelled = true;
//     };
//   }, [children]);

//   return (
//     <div className="ls-google-wrapper">
//       <div ref={buttonRef} />
//       {isLoading && <p role="status">Signing in with Google…</p>}
//       {error && <Alert kind="error">{error}</Alert>}
//     </div>
//   );
// }



export function GoogleButton({ children }) {
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google sign-in is not configured. Check your frontend .env file.");
      return undefined;
    }

    let cancelled = false;
    let observer;

    const initializeGoogle = () => {
      if (
        cancelled ||
        !buttonRef.current ||
        !wrapperRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      const renderGoogleButton = () => {
        if (cancelled || !buttonRef.current || !wrapperRef.current) return;

        const availableWidth = Math.floor(
          wrapperRef.current.getBoundingClientRect().width
        );

        if (availableWidth <= 0) return;

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: children?.toLowerCase().includes("sign up")
            ? "signup_with"
            : "signin_with",
          shape: "rectangular",
          width: Math.min(availableWidth, 400),
          logo_alignment: "left",
        });
      };

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google did not return a credential. Please try again.");
            return;
          }

          setError("");
          setIsLoading(true);

          try {
            const data = await googleLogin({
              credential: response.credential,
            });

            saveAuth(data.token, data.user);

            window.location.assign(
              data.user?.role === "admin"
                ? "/dashboard"
                : "/user-dashboard"
            );
          } catch (err) {
            setError(err.message || "Google sign-in failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      });

      renderGoogleButton();

      observer = new ResizeObserver(renderGoogleButton);
      observer.observe(wrapperRef.current);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        script.onerror = () => {
          if (!cancelled) {
            setError("Could not load Google sign-in. Please try again.");
          }
        };
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", initializeGoogle);

        if (window.google?.accounts?.id) {
          initializeGoogle();
        }
      }
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [children]);

  return (
    <div
      ref={wrapperRef}
      className="ls-google-wrapper"
      style={{ width: "100%", minWidth: 0 }}
    >
      <div
        ref={buttonRef}
        style={{ width: "100%" }}
      />

      {isLoading && <p role="status">Signing in with Google…</p>}
      {error && <Alert kind="error">{error}</Alert>}
    </div>
  );
}
