import axios from "axios";

// Helper: reads a specific cookie value by name from the browser
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // SSR guard
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// Create a configured Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Sends browser cookies automatically cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — dynamically inject the Better Auth session token
api.interceptors.request.use(
  (config) => {
    const token = getCookie("better-auth.session_token");
    console.log("token", token);
    if (token) {
      config.headers["Cookie"] = `better-auth.session_token=${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
