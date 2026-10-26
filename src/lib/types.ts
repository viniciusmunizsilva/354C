import type { AssetType, ModelFormat } from "./constants";

/** Row shape of the `projects` table. */
export interface Project {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  category: string;
  model_format: ModelFormat;
  model_storage_path: string;
  cover_storage_path: string | null;
  created_at: string;
  updated_at: string;
}

/** Row shape of the `project_assets` table. */
export interface ProjectAsset {
  id: string;
  project_id: string;
  user_id: string | null;
  storage_path: string;
  original_filename: string;
  asset_type: AssetType;
  content_type: string | null;
  file_size: number | null;
  created_at: string;
}

/** A project enriched with the signed URLs the viewer needs. */
export interface ProjectWithAssets extends Project {
  assets: ProjectAsset[];
}

/** Resolved, time-limited URLs handed to the client-side 3D viewer. */
export interface ViewerPayload {
  format: ModelFormat;
  modelUrl: string;
  /** Map of original filename (basename) -> signed URL for dependencies. */
  dependencyUrls: Record<string, string>;
}
