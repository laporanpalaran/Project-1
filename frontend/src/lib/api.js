import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("espak_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("espak_token");
      if (!window.location.pathname.includes("/login")) window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);

export function apiErr(e) {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(", ");
  return e?.message || "Terjadi kesalahan";
}

export function fileUrl(certId) {
  const token = localStorage.getItem("espak_token");
  return `${API}/certificates/${certId}/file?auth=${token}`;
}

export { API };
export default api;
