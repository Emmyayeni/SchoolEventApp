export const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

export function validateLogin({ email, password } = {}) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateSignup(values = {}) {
  const errors = validateLogin(values);
  if (!values.fullName?.trim()) errors.fullName = "Enter your full name.";
  if ((values.password || "").length < 8) errors.password = "Use at least 8 characters.";
  if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (!["student", "staff", "organizer"].includes(values.accountType)) errors.general = "Choose a valid account type.";
  if (values.accountType !== "organizer") {
    for (const field of ["faculty", "department"]) {
      if (!values[field]?.trim()) errors[field] = `Select your ${field}.`;
    }
  }
  if (values.accountType === "student") {
    if (!values.matricNumber?.trim()) errors.matricNumber = "Enter your matriculation number.";
    if (!values.level?.trim()) errors.level = "Select your level.";
  }
  if (values.accountType === "staff" && !values.staffId?.trim()) errors.staffId = "Enter your staff ID.";
  return errors;
}

export function validateEvent(values = {}) {
  const errors = {};
  for (const field of ["title", "category", "description", "venue", "organizer"]) {
    if (!String(values[field] || "").trim()) errors[field] = `Enter the event ${field}.`;
  }
  const date = String(values.date || "");
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    errors.date = "Select a valid date.";
  }
  const time = String(values.time || "").trim();
  if (!/^(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)|(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)$/i.test(time)) errors.time = "Select a valid time.";
  if (String(values.capacity ?? "").trim() && (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) <= 0)) errors.capacity = "Capacity must be a positive whole number.";
  if (values.targetAudience && !["all", "students", "staff"].includes(values.targetAudience)) errors.targetAudience = "Select a valid audience.";
  if (values.status && !["draft", "published", "cancelled", "archived"].includes(values.status)) errors.status = "Select a valid event status.";
  return errors;
}
