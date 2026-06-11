import { createClient } from "@/lib/supabase/client";

export const MENU_IMAGES_BUCKET = "menu-images";

function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadMenuImage(file: File, folder: string) {
  const supabase = createClient();
  const extension = getFileExtension(file);
  const safeFolder = sanitizePathSegment(folder) || "general";
  const filePath = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(MENU_IMAGES_BUCKET).upload(filePath, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MENU_IMAGES_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
}
