import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data, loading: false });
      toast.success("Signup successful!");
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
      return false;
    }
  },
  
  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
      toast.success("Login successful!");
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      // Only set user if we actually got valid data
      if (response.data && response.data._id) {
        set({ user: response.data, checkingAuth: false });
      } else {
        set({ user: null, checkingAuth: false });
      }
    } catch (error) {
      console.log("Auth check failed:", error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
  updateUserProfile: async (updatedData) => {
    set({ loading: true });
    try {
      const res = await axios.put("/auth/profile", updatedData); // Make sure your API supports this route
      set({ user: res.data, loading: false }); // Update the user store with the new profile data
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    }
  },
  unlockedAchievement: null,
  setUnlockedAchievement: (achievement) => set({ unlockedAchievement: achievement }),
}));

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);