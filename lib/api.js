import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.API_BASE;
const csrfToken = Cookies.get("csrftoken");

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "X-CSRFToken": csrfToken,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* Attach auth token to every request */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Handle auth errors globally */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);
