// Centralized API Base URL configuration
// In development, falls back to http://localhost:3000
// In production (e.g. Vercel), set VITE_API_URL in your environment variables
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
