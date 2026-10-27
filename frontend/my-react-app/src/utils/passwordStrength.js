export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  return Math.min(strength, 100);
};

export const getStrengthLabel = (strength) => {
  if (strength < 50) return { text: "Weak", color: "#ED5565" };
  if (strength < 75) return { text: "Good", color: "#FFCE54" };
  return { text: "Strong", color: "#A0D468" };
};
