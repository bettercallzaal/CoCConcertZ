/**
 * Cloudinary upload helper — replaces Firebase Storage.
 * Calls the internal /api/upload route which handles the SDK call server-side.
 */
export async function uploadFile(
  file: File,
  folder: string = "coc-concertz"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}
