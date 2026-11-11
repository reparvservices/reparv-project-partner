const URI = import.meta.env.VITE_BACKEND_URL;

export const uploadToS3 = async (file) => {
  try {
    const res = await fetch(`${URI}/api/s3/signed-url/get`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder: "uploads", // No folder, upload to root
      }),
    });

    if (!res.ok) throw new Error("Failed to get signed URL");

    const { uploadUrl, fileUrl } = await res.json();
    
    const upload = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!upload.ok) throw new Error(`Upload rejected (${upload.status})`);

    return fileUrl;
  } catch (err) {
    console.error("S3 upload failed:", err);
    return null;
  }
};