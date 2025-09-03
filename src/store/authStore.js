import { create } from "zustand";
import { baseUrl } from "../Constants";

let navigateToHome = null;
if (typeof window !== "undefined") {
  try {

    navigateToHome = () => {
      window.location.href = "/";
    };
  } catch (e) {
    navigateToHome = null;
  }
}

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

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

      set({ user: data.user, token: data.token, loading: false });

      if (navigateToHome) {
        navigateToHome();
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;
