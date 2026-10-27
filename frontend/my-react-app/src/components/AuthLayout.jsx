import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./public/Logo";
import { usePublicPage } from "./public/hooks";

/** Shared split-screen shell: form on white, linguistic illustration on soft lavender. */
const AuthLayout = ({ children, sidePanel, variant = "login" }) => {
  usePublicPage();
  return (
    <main className={`ls-site ls-auth ls-auth-${variant}`}>
      <div className="ls-auth-shell">
        <section className="ls-auth-formside">
          <header className="ls-auth-top">
            <Logo />
            <Link to="/" className="ls-back"><ArrowLeft size={15} /> Home</Link>
          </header>
          <div className="ls-auth-form">{children}</div>
          <p className="ls-auth-foot">© {new Date().getFullYear()} learnsphere</p>
        </section>
        {sidePanel}
      </div>
    </main>
  );
};

export default AuthLayout;
