"use client";

import dynamic from "next/dynamic";
import type { ViewerPayload } from "@/lib/types";

// WebGL/Three.js must never run during SSR — load the viewer client-side only.
const ModelViewer = dynamic(
  () => import("./model-viewer").then((m) => m.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-card">
        <div className="size-10 animate-spin rounded-full border-2 border-muted border-t-accent" />
      </div>
    ),
  },
);

export function ViewerCanvas({ payload }: { payload: ViewerPayload }) {
  // Key on the model URL so switching models mounts a fresh viewer (clean
  // state + guaranteed WebGL resource disposal of the previous model).
  return <ModelViewer key={payload.modelUrl} payload={payload} />;
}
