import axios from "axios";

axios.defaults.withCredentials = true;

let handleUnauthorized = null;

/** Register 401 handler from AuthProvider (clears session + redirect). */
export function registerUnauthorizedHandler(fn) {
  handleUnauthorized = fn;
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const isLoginRequest = /\/(project-partner|sales|territory-partner)\/login/.test(
      url,
    );

    if (status === 401 && handleUnauthorized && !isLoginRequest) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default axios;
