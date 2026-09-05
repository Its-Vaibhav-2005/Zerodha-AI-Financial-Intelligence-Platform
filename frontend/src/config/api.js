// Centralized API configuration
// In local Vite dev mode with proxy or in production (single container / Docker),
// relative URLs ('') automatically resolve to the hosting server.
// If VITE_API_URL is set, it overrides the base URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
