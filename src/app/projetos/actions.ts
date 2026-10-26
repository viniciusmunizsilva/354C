"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { STORAGE_BUCKET, projectPrefix } from "@/lib/storage";
import { validateAssetMetadata } from "@/lib/validation";
import {
  CATEGORIES,
  MODEL_FORMATS,
  type AssetType,
  type ModelFormat,
} from "@/lib/constants";

export interface UploadedAssetInput {
  storagePath: string;
  originalFilename: string;
  assetType: AssetType;
  contentType: string | null;
  fileSize: number;
}

export interface CreateProjectInput {
  projectId: string;
  title: string;
  description: string;
  category: string;
  modelFormat: ModelFormat;
  model: UploadedAssetInput;
  dependencies: UploadedAssetInput[];
  cover: UploadedAssetInput | null;
}

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function validCategory(value: string): boolean {
  return CATEGORIES.some((c) => c.value === value);
}

function sanitizeText(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export async function createProjectAction(
  input: CreateProjectInput,
): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return { ok: false, error: "Backend não configurado." };
  }

  const title = sanitizeText(input.title, 160);
  if (!title) return { ok: false, error: "O título é obrigatório." };
  if (!validCategory(input.category)) {
    return { ok: false, error: "Categoria inválida." };
  }
  if (!MODEL_FORMATS.includes(input.modelFormat)) {
    return { ok: false, error: "Formato de modelo inválido." };
  }

  const allAssets = [
    input.model,
    ...input.dependencies,
    ...(input.cover ? [input.cover] : []),
  ];

  // Trusted-layer re-validation of every asset's metadata.
  for (const asset of allAssets) {
    const problem = validateAssetMetadata({
      originalFilename: asset.originalFilename,
      assetType: asset.assetType,
      fileSize: asset.fileSize,
    });
    if (problem) {
      await cleanupStorage(supabase, input.projectId);
      return { ok: false, error: problem };
    }
    if (!asset.storagePath.startsWith(projectPrefix(input.projectId) + "/")) {
      await cleanupStorage(supabase, input.projectId);
      return { ok: false, error: "Caminho de armazenamento inválido." };
    }
  }

  const { error: projectError } = await supabase.from("projects").insert({
    id: input.projectId,
    title,
    description: sanitizeText(input.description, 4000) || null,
    category: input.category,
    model_format: input.modelFormat,
    model_storage_path: input.model.storagePath,
    cover_storage_path: input.cover?.storagePath ?? null,
  });

  if (projectError) {
    await cleanupStorage(supabase, input.projectId);
    return { ok: false, error: `Falha ao salvar o projeto: ${projectError.message}` };
  }

  const assetRows = allAssets.map((a) => ({
    project_id: input.projectId,
    storage_path: a.storagePath,
    original_filename: a.originalFilename,
    asset_type: a.assetType,
    content_type: a.contentType,
    file_size: a.fileSize,
  }));

  const { error: assetsError } = await supabase
    .from("project_assets")
    .insert(assetRows);

  if (assetsError) {
    await supabase.from("projects").delete().eq("id", input.projectId);
    await cleanupStorage(supabase, input.projectId);
    return { ok: false, error: `Falha ao salvar os arquivos: ${assetsError.message}` };
  }

  revalidatePath("/projetos");
  return { ok: true, id: input.projectId };
}

export async function updateProjectMetaAction(args: {
  id: string;
  title: string;
  description: string;
  category: string;
}): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Backend não configurado." };

  const title = sanitizeText(args.title, 160);
  if (!title) return { ok: false, error: "O título é obrigatório." };
  if (!validCategory(args.category)) {
    return { ok: false, error: "Categoria inválida." };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      description: sanitizeText(args.description, 4000) || null,
      category: args.category,
    })
    .eq("id", args.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${args.id}`);
  return { ok: true, id: args.id };
}

/** Replace the cover image. The caller uploads the new cover first. */
export async function updateCoverAction(args: {
  id: string;
  cover: UploadedAssetInput;
  previousCoverPath: string | null;
}): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Backend não configurado." };

  const problem = validateAssetMetadata({
    originalFilename: args.cover.originalFilename,
    assetType: "cover",
    fileSize: args.cover.fileSize,
  });
  if (problem) return { ok: false, error: problem };

  const { error } = await supabase
    .from("projects")
    .update({ cover_storage_path: args.cover.storagePath })
    .eq("id", args.id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("project_assets").insert({
    project_id: args.id,
    storage_path: args.cover.storagePath,
    original_filename: args.cover.originalFilename,
    asset_type: "cover",
    content_type: args.cover.contentType,
    file_size: args.cover.fileSize,
  });

  // Remove the now-unused previous cover (only when no longer referenced).
  if (
    args.previousCoverPath &&
    args.previousCoverPath !== args.cover.storagePath
  ) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([args.previousCoverPath]);
    await supabase
      .from("project_assets")
      .delete()
      .eq("project_id", args.id)
      .eq("storage_path", args.previousCoverPath);
  }

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${args.id}`);
  return { ok: true, id: args.id };
}

export async function replaceModelAction(args: {
  projectId: string;
  modelFormat: ModelFormat;
  model: UploadedAssetInput;
  dependencies: UploadedAssetInput[];
}): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Backend não configurado." };

  if (!MODEL_FORMATS.includes(args.modelFormat)) {
    return { ok: false, error: "Formato de modelo inválido." };
  }

  const incoming = [args.model, ...args.dependencies];
  for (const asset of incoming) {
    const problem = validateAssetMetadata({
      originalFilename: asset.originalFilename,
      assetType: asset.assetType,
      fileSize: asset.fileSize,
    });
    if (problem) return { ok: false, error: problem };
    if (!asset.storagePath.startsWith(projectPrefix(args.projectId) + "/")) {
      return { ok: false, error: "Caminho de armazenamento inválido." };
    }
  }

  // Paths currently stored for the model + its dependencies.
  const { data: oldAssets } = await supabase
    .from("project_assets")
    .select("storage_path")
    .eq("project_id", args.projectId)
    .in("asset_type", ["model", "mtl", "texture"]);

  const newPaths = new Set(incoming.map((a) => a.storagePath));

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      model_format: args.modelFormat,
      model_storage_path: args.model.storagePath,
    })
    .eq("id", args.projectId);
  if (updateError) return { ok: false, error: updateError.message };

  await supabase
    .from("project_assets")
    .delete()
    .eq("project_id", args.projectId)
    .in("asset_type", ["model", "mtl", "texture"]);

  const { error: insertError } = await supabase.from("project_assets").insert(
    incoming.map((a) => ({
      project_id: args.projectId,
      storage_path: a.storagePath,
      original_filename: a.originalFilename,
      asset_type: a.assetType,
      content_type: a.contentType,
      file_size: a.fileSize,
    })),
  );
  if (insertError) return { ok: false, error: insertError.message };

  // Remove previous objects that the new model set no longer references.
  const orphans = (oldAssets ?? [])
    .map((a) => a.storage_path)
    .filter((p) => !newPaths.has(p));
  if (orphans.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(orphans);
  }

  revalidatePath("/projetos");
  revalidatePath(`/projetos/${args.projectId}`);
  return { ok: true, id: args.projectId };
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Backend não configurado." };

  // Gather every stored object for this project before deleting the rows.
  const { data: assets } = await supabase
    .from("project_assets")
    .select("storage_path")
    .eq("project_id", id);

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  const paths = (assets ?? []).map((a) => a.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }
  // Also sweep the project folder for any orphan objects.
  await cleanupStorage(supabase, id);

  revalidatePath("/projetos");
  return { ok: true, id };
}

/** Separate entrypoint used by the delete dialog that redirects afterwards. */
export async function deleteProjectAndRedirect(id: string): Promise<void> {
  const result = await deleteProjectAction(id);
  if (result.ok) redirect("/projetos");
}

/**
 * Remove objects uploaded for a project that was never committed to the DB
 * (e.g. an upload failed partway, or the user cancelled). Only ever targets
 * the project's own storage prefix.
 */
export async function discardUploadsAction(projectId: string): Promise<void> {
  const supabase = await getServerSupabase();
  if (!supabase) return;
  // Guard: never run cleanup for a prefix that already has a committed project.
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();
  if (data) return;
  await cleanupStorage(supabase, projectId);
}

type ServerClient = NonNullable<Awaited<ReturnType<typeof getServerSupabase>>>;

/** Best-effort removal of every object under a project's storage prefix. */
async function cleanupStorage(supabase: ServerClient, projectId: string) {
  const prefix = projectPrefix(projectId);
  const folders = ["model", "deps", "cover"];
  const toRemove: string[] = [];
  for (const folder of folders) {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`${prefix}/${folder}`, { limit: 100 });
    for (const entry of data ?? []) {
      if (entry.name) toRemove.push(`${prefix}/${folder}/${entry.name}`);
    }
  }
  if (toRemove.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
  }
}
