"use client";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/config";
import { STORAGE_BUCKET } from "./constants";

/**
 * Upload a single file to Supabase Storage via XHR so we get byte-level
 * progress (the supabase-js `upload` helper does not expose it). Resources are
 * uploaded directly from the browser to keep large 3D files out of the server
 * request path; the server then re-validates metadata before committing rows.
 */
export function uploadFileToStorage(args: {
  path: string;
  file: File;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { path, file, onProgress, signal } = args;

  return new Promise((resolve, reject) => {
    const encodedPath = path
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodedPath}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader(
      "content-type",
      file.type || "application/octet-stream",
    );
    xhr.setRequestHeader("cache-control", "3600");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(file.size, file.size);
        resolve();
      } else {
        reject(
          new Error(
            `Falha ao enviar "${file.name}" (HTTP ${xhr.status}). ${safeMessage(xhr.responseText)}`,
          ),
        );
      }
    };
    xhr.onerror = () =>
      reject(new Error(`Erro de rede ao enviar "${file.name}".`));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(file);
  });
}

function safeMessage(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.error || "";
  } catch {
    return "";
  }
}
