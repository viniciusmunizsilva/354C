import "server-only";

import { getServerSupabase } from "./supabase/server";
import { STORAGE_BUCKET } from "./storage";
import { basename } from "./constants";
import type {
  Project,
  ProjectAsset,
  ProjectWithAssets,
  ViewerPayload,
} from "./types";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export interface ProjectListItem extends Project {
  coverUrl: string | null;
}

/** Fetch all projects (newest activity first) with signed cover URLs. */
export async function listProjects(): Promise<ProjectListItem[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  const projects = (data ?? []) as Project[];

  const coverPaths = projects
    .map((p) => p.cover_storage_path)
    .filter((p): p is string => Boolean(p));

  const coverMap = new Map<string, string>();
  if (coverPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(coverPaths, SIGNED_URL_TTL);
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) coverMap.set(s.path, s.signedUrl);
    }
  }

  return projects.map((p) => ({
    ...p,
    coverUrl: p.cover_storage_path
      ? (coverMap.get(p.cover_storage_path) ?? null)
      : null,
  }));
}

export async function getProjectWithAssets(
  id: string,
): Promise<ProjectWithAssets | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!project) return null;

  const { data: assets } = await supabase
    .from("project_assets")
    .select("*")
    .eq("project_id", id);

  return { ...(project as Project), assets: (assets ?? []) as ProjectAsset[] };
}

/** Sign the model + its dependencies for the client viewer. */
export async function buildViewerPayload(
  project: ProjectWithAssets,
): Promise<ViewerPayload | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const dependencyAssets = project.assets.filter(
    (a) => a.asset_type === "mtl" || a.asset_type === "texture",
  );

  const pathsToSign = [
    project.model_storage_path,
    ...dependencyAssets.map((a) => a.storage_path),
  ];

  const { data: signed, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(pathsToSign, SIGNED_URL_TTL);
  if (error) throw new Error(error.message);

  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.signedUrl && s.path) urlByPath.set(s.path, s.signedUrl);
  }

  const modelUrl = urlByPath.get(project.model_storage_path);
  if (!modelUrl) return null;

  const dependencyUrls: Record<string, string> = {};
  for (const asset of dependencyAssets) {
    const url = urlByPath.get(asset.storage_path);
    if (url) dependencyUrls[basename(asset.original_filename).toLowerCase()] = url;
  }

  return { format: project.model_format, modelUrl, dependencyUrls };
}

export async function signCoverUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}
