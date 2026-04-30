export function usePasswordStrength(password) {
  if (!password) return null;
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length < 6)               return { level: 1, label: "Too short", color: "bg-red-500" };
  if (password.length < 8 || classes < 2) return { level: 2, label: "Weak",      color: "bg-orange-400" };
  if (classes < 3)                        return { level: 3, label: "Fair",      color: "bg-yellow-400" };
  if (password.length < 12)              return { level: 4, label: "Good",      color: "bg-lime-400" };
  return                                          { level: 5, label: "Strong",   color: "bg-green-400" };
}
