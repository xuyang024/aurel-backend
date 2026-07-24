import Medusa from "@medusajs/js-sdk";

// Admin dashboard is served from the backend, so a relative base + session auth
// reuses the logged-in admin's credentials.
export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: { type: "session" },
});
