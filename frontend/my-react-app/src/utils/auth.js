
export const API_URL = "http://localhost:8000/api/auth";

/* -------------------------
   Email Validation
-------------------------- */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/* -------------------------
   Password Strength Logic
-------------------------- */
export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  return Math.min(strength, 100);
};

export const getPasswordStrengthLabel = (strength) => {
  if (strength < 50) return "Weak";
  if (strength < 75) return "Good";
  return "Strong";
};

/* -------------------------
   Auth Storage Helpers
-------------------------- */
export const saveAuth = (token, user) => {
  if (token) localStorage.setItem("authToken", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export const logout = () => {
  clearAuth();          // ✅ single source of truth
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("authToken"));
};

/* -------------------------
   Side Panel Feature Data
-------------------------- */
export const RECIPE_FEATURES = {
  login: [
    { icon: "fa-book-open", text: "Access 3003+ Recipes" },
    { icon: "fa-video", text: "Step-by-Step Video Tutorials" },
    { icon: "fa-utensils", text: "Chef-Crafted Instructions" },
    { icon: "fa-heart", text: "Save Favorite Recipes" },
  ],
  signup: [
    { icon: "fa-user-chef", text: "Personal Cooking Profile" },
    { icon: "fa-clipboard-list", text: "Create Meal Plans" },
    { icon: "fa-users", text: "Join Cooking Community" },
    { icon: "fa-award", text: "Earn Cooking Badges" },
  ],
  forgot: [
    { icon: "fa-shield-alt", text: "Secure Account Recovery" },
    { icon: "fa-clock", text: "Quick Password Reset" },
    { icon: "fa-bell", text: "Instant Notifications" },
    { icon: "fa-headset", text: "Chef Support Available" },
  ],
  reset: [
    { icon: "fa-key", text: "Secure Password Management" },
    { icon: "fa-check-circle", text: "Verified Security" },
    { icon: "fa-user-shield", text: "Account Protection" },
    { icon: "fa-history", text: "Activity Monitoring" },
  ],
};
