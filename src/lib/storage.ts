import { STORAGE_BUCKET, basename, type AssetType } from "./constants";

export { STORAGE_BUCKET };

/** Placeholder owner segment while the app runs without auth. */
export const OWNER_SEGMENT = "public";

/** Make a filename safe for a storage key while preserving its extension. */
export function sanitizeFilename(name: string): string {
  const base = basename(name);
  return base
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

const FOLDER: Record<AssetType, string> = {
  model: "model",
  mtl: "deps",
  texture: "deps",
  cover: "cover",
};

/**
 * Build a collision-free storage key namespaced by project.
 * Dependencies keep their original basename so OBJ/MTL/texture references
 * resolve correctly in the viewer.
 */
export function buildStoragePath(args: {
  projectId: string;
  assetType: AssetType;
  filename: string;
}): string {
  const { projectId, assetType, filename } = args;
  return `${OWNER_SEGMENT}/${projectId}/${FOLDER[assetType]}/${sanitizeFilename(filename)}`;
}

/** The project-scoped prefix used when deleting every object of a project. */
export function projectPrefix(projectId: string): string {
  return `${OWNER_SEGMENT}/${projectId}`;
}
