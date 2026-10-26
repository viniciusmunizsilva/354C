"use client";

import { uploadFileToStorage } from "./upload-client";
import { buildStoragePath } from "./storage";
import { classifyDependency } from "./validation";
import type { AssetType } from "./constants";
import type { UploadedAssetInput } from "@/app/projetos/actions";

interface UploadItem {
  file: File;
  assetType: AssetType;
}

export interface UploadedAssets {
  model?: UploadedAssetInput;
  dependencies: UploadedAssetInput[];
  cover?: UploadedAssetInput;
}

/**
 * Upload the model + dependencies + cover for a project, reporting a single
 * aggregate progress value across all files.
 */
export async function uploadProjectAssets(args: {
  projectId: string;
  model?: File | null;
  dependencies?: File[];
  cover?: File | null;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}): Promise<UploadedAssets> {
  const items: UploadItem[] = [];
  if (args.model) items.push({ file: args.model, assetType: "model" });
  for (const dep of args.dependencies ?? []) {
    items.push({ file: dep, assetType: classifyDependency(dep.name) ?? "texture" });
  }
  if (args.cover) items.push({ file: args.cover, assetType: "cover" });

  const totalBytes = items.reduce((sum, i) => sum + i.file.size, 0) || 1;
  const loadedByItem = new Array(items.length).fill(0);
  const results: UploadedAssetInput[] = [];

  for (let idx = 0; idx < items.length; idx++) {
    const { file, assetType } = items[idx];
    const path = buildStoragePath({
      projectId: args.projectId,
      assetType,
      filename: file.name,
    });

    await uploadFileToStorage({
      path,
      file,
      signal: args.signal,
      onProgress: (loaded) => {
        loadedByItem[idx] = loaded;
        const sum = loadedByItem.reduce((a: number, b: number) => a + b, 0);
        args.onProgress?.(Math.min(99, Math.round((sum / totalBytes) * 100)));
      },
    });

    results.push({
      storagePath: path,
      originalFilename: file.name,
      assetType,
      contentType: file.type || null,
      fileSize: file.size,
    });
  }

  args.onProgress?.(100);

  return {
    model: results.find((r) => r.assetType === "model"),
    cover: results.find((r) => r.assetType === "cover"),
    dependencies: results.filter(
      (r) => r.assetType === "mtl" || r.assetType === "texture",
    ),
  };
}
