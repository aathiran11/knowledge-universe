// In development, Vite reads this from client/.env (VITE_API_URL).
// In production (Vercel), set VITE_API_URL in the project's environment variables
// to your deployed backend's URL (e.g. https://knowledge-universe-pwsf.onrender.com).
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
