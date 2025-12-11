// /lib/formatDate.js

export function formatDateTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",     // Dec, Nov, Jan
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true        // 👈 12-hour clock with AM / PM
  });
}

export function formatDateOnly(date) {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0]; 
}

