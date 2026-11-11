// ─────────────────────────────────────────────────────────────────────────────
// feedUtils.js  —  shared helpers, icons, primitives, API wrappers
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE = import.meta.env.VITE_BACKEND_URL + "/api/feed";
export const FOLLOW_API_BASE = import.meta.env.VITE_BACKEND_URL + "/api/follow";

// ─── Role normalisation ───────────────────────────────────────────────────────
export const normaliseRole = (role) => {
  const map = {
    "Sales Person": "sales_partner",
    "Territory Person": "territory_partner",
    "Project Person": "project_partner",
    sales: "sales_partner",
    territory: "territory_partner",
    project: "project_partner",
    sales_partner: "sales_partner",
    territory_partner: "territory_partner",
    project_partner: "project_partner",
    "Sales Partner": "sales_partner",
    "Territory Partner": "territory_partner",
    "Project Partner": "project_partner",
    "sales person": "sales_partner",
    "territory person": "territory_partner",
    "project person": "project_partner",
    "sales partner": "sales_partner",
    "territory partner": "territory_partner",
    "project partner": "project_partner",
  };
  return map[role] || map[role?.toLowerCase?.()] || null;
};

// ─── API helpers ──────────────────────────────────────────────────────────────
export const api = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

export const followApi = async (path, opts = {}) => {
  const res = await fetch(`${FOLLOW_API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const timeAgo = (dateStr) => {
  const s = (Date.now() - new Date(dateStr)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const parseMedia = (raw) => {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return raw ? [raw] : [];
  }
};

export const isVideo = (url = "") =>
  /\.(mp4|webm|mov)/i.test(url) || url.includes("video");

// ─── Role config ──────────────────────────────────────────────────────────────
export const ROLE = {
  sales_partner: { label: "Sales Partner", color: "#e11d48", bg: "#fff1f2" },
  territory_partner: {
    label: "Territory Partner",
    color: "#0284c7",
    bg: "#e0f2fe",
  },
  project_partner: {
    label: "Project Partner",
    color: "#7c3aed",
    bg: "#ede9fe",
  },
};

// ─── SVG path map ─────────────────────────────────────────────────────────────
export const PATHS = {
  heart:
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  "heart-fill":
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  comment: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  share: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  "bm-fill": "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  image:
    "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M21 15l-5-5L5 20",
  video:
    "M23 7l-7 5 7 5V7zM1 5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  "more-v": "M12 5h.01M12 12h.01M12 19h.01",
  "more-h": "M5 12h.01M12 12h.01M19 12h.01",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  chevright: "M9 18l6-6-6-6",
  chevleft: "M15 18l-6-6 6-6",
  chevup: "M18 15l-6-6-6 6",
  chevdown: "M6 9l6 6 6-6",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  film: "M2 2h20v20H2zM7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  "volume-x":
    "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z",
  "volume-2":
    "M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  music:
    "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  arrowleft: "M19 12H5M12 19l-7-7 7-7",
  check: "M20 6L9 17l-5-5",
  location:
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
};
