import { create } from "zustand";
import { baseUrl } from "../Constants";

// For navigation after login
let navigateToHome = null;
if (typeof window !== "undefined") {
  // Dynamically import navigate from react-router-dom if available
  try {
    // This is a workaround for using navigation outside React components
    // It will only work if window.location is available (browser)
    navigateToHome = () => {
      window.location.href = "/";
    };
  } catch (e) {
    // fallback: do nothing
    navigateToHome = null;
  }
}

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // 🔹 async login function
  login: async (phone, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${baseUrl}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // update state
      set({ user: data.user, token: data.token, loading: false });

      // Navigate to home on successful login
      if (navigateToHome) {
        navigateToHome();
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 🔹 logout
  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;
