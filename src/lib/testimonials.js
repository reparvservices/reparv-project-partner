import { getImageURI } from "../utils/helper";

const VIDEO_PLACEHOLDER_CLIENTS = new Set([
  "Territory Partner",
  "Project Partner",
  "Onboarding Partner",
  "Sales Partner",
  "Reparv",
]);

function isPartnerReviewTestimonial(row) {
  const message = String(row?.message || "").trim();
  const client = String(row?.client || "").trim();

  if (!message || !client) return false;
  if (VIDEO_PLACEHOLDER_CLIENTS.has(client)) return false;
  if (/^this video/i.test(message) || /video only/i.test(message)) {
    return false;
  }
  if (/^why choose reparv/i.test(message)) return false;

  return true;
}

export function mapApiTestimonial(row) {
  return {
    id: row.id,
    quote: row.message?.trim() || "",
    name: row.client?.trim() || "Reparv Partner",
    role: "Verified Reparv Partner",
    avatar: getImageURI(row.clientimage),
    videoUrl: row.url?.trim() || null,
  };
}

export async function fetchPartnerTestimonials(apiBase) {
  const base = (apiBase || "").replace(/\/$/, "");
  if (!base) return [];

  const res = await fetch(`${base}/frontend/testimonial`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load testimonials (${res.status})`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows)) return [];

  return rows.filter(isPartnerReviewTestimonial).map(mapApiTestimonial);
}
