/**
 * Domain constants shared by the client and server.
 *
 * Upload limits are intentionally centralized and can be tuned via environment
 * variables so they are configurable without a code change (as required by the
 * brief). The defaults below are conservative for a free-tier Supabase bucket.
 */

export const STORAGE_BUCKET = "models";

/** Project categories offered in the UI. */
export const CATEGORIES = [
  { value: "quarto", label: "Quarto" },
  { value: "suite", label: "Suíte" },
  { value: "sala", label: "Sala" },
  { value: "cozinha", label: "Cozinha" },
  { value: "banheiro", label: "Banheiro" },
  { value: "outro", label: "Outro" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/** Supported primary 3D model formats. */
export const MODEL_FORMATS = ["obj", "fbx"] as const;
export type ModelFormat = (typeof MODEL_FORMATS)[number];

/** Asset roles stored in `project_assets.asset_type`. */
export type AssetType = "model" | "mtl" | "texture" | "cover";

const MB = 1024 * 1024;

function envNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Max size for the primary model file (OBJ/FBX). Default 60 MB. */
export const MAX_MODEL_BYTES = envNumber("NEXT_PUBLIC_MAX_MODEL_MB", 60) * MB;
/** Max size for a single dependency (MTL / texture). Default 25 MB. */
export const MAX_ASSET_BYTES = envNumber("NEXT_PUBLIC_MAX_ASSET_MB", 25) * MB;
/** Max size for the cover image. Default 8 MB. */
export const MAX_COVER_BYTES = envNumber("NEXT_PUBLIC_MAX_COVER_MB", 8) * MB;
/** Max number of dependency files per project. */
export const MAX_DEPENDENCIES = envNumber("NEXT_PUBLIC_MAX_DEPENDENCIES", 40);

export const MODEL_EXTENSIONS = [".obj", ".fbx"];
export const TEXTURE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tga",
  ".gif",
];
export const MTL_EXTENSIONS = [".mtl"];
export const COVER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

/** basename of a path, stripping any directory components (posix or win). */
export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}
