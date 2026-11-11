export const getImageURI = (path) => {
  // Fast exit
  if (!path || typeof path !== "string") return "";

  // If already absolute URL → return as-is
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  const base =
    import.meta.env.VITE_S3_IMAGE_URL ||
    "https://reparv-assets.s3.ap-south-1.amazonaws.com";
  // Ensure single slash between base and path
  return `${base}/${path.replace(/^\/+/, "")}`;
};
/** Photo list from a column value: array, JSON text, or double-encoded JSON. */
export const parseImageList = (value) => {
  let parsed = value;
  for (let i = 0; i < 3 && typeof parsed === "string"; i++) {
    const text = parsed.trim();
    if (!text) return [];
    if (!text.startsWith("[") && !text.startsWith('"')) {
      return /^https?:\/\/|^\//.test(text) ? [text] : [];
    }
    try {
      parsed = JSON.parse(text);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed)
    ? parsed.filter((v) => typeof v === "string" && v.trim())
    : [];
};
