import { supabase } from "../../lib/superbase";

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  eventImages: "event-images",
  announcementFiles: "announcement-files",
};

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function sanitizePath(path, bucket) {
  const raw = String(path || "").trim();
  if (!raw) {
    return "";
  }

  if (raw.startsWith("/")) {
    return raw.replace(/^\/+/, "");
  }

  const bucketPrefix = `${bucket}/`;
  if (raw.startsWith(bucketPrefix)) {
    return raw.slice(bucketPrefix.length);
  }

  return raw;
}

export function resolveStoragePublicUrl(pathOrUrl, bucket, fallback = "") {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) {
    return fallback;
  }

  if (isAbsoluteUrl(raw)) {
    return raw;
  }

  const cleanPath = sanitizePath(raw, bucket);
  if (!cleanPath) {
    return fallback;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
  return data?.publicUrl || fallback || raw;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }

  const uid = data?.user?.id;
  if (!uid) {
    throw new Error("You need to be logged in before uploading files.");
  }

  return uid;
}

function inferFileExtension(uri = "") {
  const match = String(uri).toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
  if (!match?.[1]) {
    return "jpg";
  }

  const ext = match[1];
  if (["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) {
    return ext;
  }

  return "jpg";
}

function contentTypeForExtension(extension) {
  if (extension === "png") {
    return "image/png";
  }
  if (extension === "webp") {
    return "image/webp";
  }
  if (extension === "heic") {
    return "image/heic";
  }
  return "image/jpeg";
}

export async function uploadImageToBucket({ bucket, userId, localUri }) {
  const totalStartedAt = Date.now();
  const ownerId = await getAuthenticatedUserId();
  const safeUserId = ownerId || userId;

  const extension = inferFileExtension(localUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const filePath = `${safeUserId}/${fileName}`;

  const blobStartedAt = Date.now();
  const response = await fetch(localUri);
  const fileArrayBuffer = await response.arrayBuffer();
  console.log("[storage.upload] local file prepared", {
    bucket,
    filePath,
    durationMs: Date.now() - blobStartedAt,
  });

  const uploadStartedAt = Date.now();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileArrayBuffer, {
      contentType: contentTypeForExtension(extension),
      upsert: false,
    });

  console.log("[storage.upload] upload request done", {
    bucket,
    filePath,
    durationMs: Date.now() - uploadStartedAt,
  });

  if (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("row-level security") || message.includes("violates row-level security")) {
      throw new Error(
        `Upload blocked by storage policy. Expected path prefix "${ownerId}/" in bucket "${bucket}".`
      );
    }
    throw error;
  }

  console.log("[storage.upload] success", {
    bucket,
    filePath,
    durationMs: Date.now() - totalStartedAt,
  });

  return {
    path: filePath,
    publicUrl: resolveStoragePublicUrl(filePath, bucket, ""),
  };
}
