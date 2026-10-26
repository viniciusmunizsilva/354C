"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  AlertTriangle,
  Box as BoxIcon,
  Grid3x3,
  Maximize,
  Sun,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewerPayload } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { loadModel, disposeObject, ModelLoadError } from "./load-model";
import { CameraRig, type ViewMode } from "./camera-rig";

type Status = "loading" | "ready" | "error";

export function ModelViewer({ payload }: { payload: ViewerPayload }) {
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [object, setObject] = useState<THREE.Object3D | null>(null);

  const [view, setView] = useState<ViewMode>("perspective");
  const [showGrid, setShowGrid] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [fitSignal, setFitSignal] = useState(0);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // The wrapper remounts this component per model (keyed on modelUrl), so the
  // effect starts from fresh initial state and only calls setState from async
  // callbacks — never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.Object3D | null = null;

    loadModel({
      format: payload.format,
      modelUrl: payload.modelUrl,
      dependencyUrls: payload.dependencyUrls,
      onProgress: (pct) => {
        if (!cancelled) setProgress(pct);
      },
    })
      .then((obj) => {
        if (cancelled) {
          disposeObject(obj);
          return;
        }
        loaded = obj;
        setObject(obj);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(
          err instanceof ModelLoadError
            ? err.message
            : "Ocorreu um erro inesperado ao carregar o modelo.",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
      disposeObject(loaded);
    };
  }, [payload.format, payload.modelUrl, payload.dependencyUrls]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_50%_30%,#ffffff,#eceae4)]">
      {object ? (
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [3, 2, 3], fov: 45, near: 0.1, far: 2000 }}
        >
          <hemisphereLight args={[0xffffff, 0xb9b3a7, 0.55 * lightIntensity]} />
          <ambientLight intensity={0.35 * lightIntensity} />
          <directionalLight
            position={[6, 10, 6]}
            intensity={1.1 * lightIntensity}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-6, 4, -4]} intensity={0.3 * lightIntensity} />

          <primitive object={object} />

          {showGrid ? (
            <Grid
              infiniteGrid
              fadeDistance={60}
              fadeStrength={4}
              cellColor="#cfc9bd"
              sectionColor="#b0a99b"
              position={[0, boxFloor(object), 0]}
            />
          ) : null}

          <CameraRig
            object={object}
            view={view}
            fitSignal={fitSignal}
            controlsRef={controlsRef}
          />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
          />
        </Canvas>
      ) : null}

      {status === "loading" ? <LoadingOverlay progress={progress} /> : null}
      {status === "error" ? <ErrorOverlay message={errorMsg} /> : null}

      {status === "ready" ? (
        <ViewerToolbar
          view={view}
          showGrid={showGrid}
          lightIntensity={lightIntensity}
          onToggleView={() =>
            setView((v) => (v === "perspective" ? "top" : "perspective"))
          }
          onToggleGrid={() => setShowGrid((g) => !g)}
          onRecenter={() => setFitSignal((n) => n + 1)}
          onLight={setLightIntensity}
        />
      ) : null}
    </div>
  );
}

function boxFloor(object: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(object);
  return box.isEmpty() ? 0 : box.min.y;
}

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-sm">
      <div className="w-56 space-y-3 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-muted border-t-accent" />
        <Progress value={progress} indeterminate={progress === 0} />
        <p className="text-sm text-muted-foreground">
          Carregando modelo{progress > 0 ? ` · ${progress}%` : "…"}
        </p>
      </div>
    </div>
  );
}

function ErrorOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <p className="max-w-sm text-sm text-foreground">{message}</p>
    </div>
  );
}

interface ToolbarProps {
  view: ViewMode;
  showGrid: boolean;
  lightIntensity: number;
  onToggleView: () => void;
  onToggleGrid: () => void;
  onRecenter: () => void;
  onLight: (v: number) => void;
}

function ViewerToolbar({
  view,
  showGrid,
  lightIntensity,
  onToggleView,
  onToggleGrid,
  onRecenter,
  onLight,
}: ToolbarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur">
        <ToolButton
          label="Recentralizar câmera"
          onClick={onRecenter}
          icon={<Maximize className="size-4" />}
        />
        <ToolButton
          label={view === "perspective" ? "Visualização superior" : "Perspectiva"}
          active={view === "top"}
          onClick={onToggleView}
          icon={
            view === "perspective" ? (
              <BoxIcon className="size-4" />
            ) : (
              <Video className="size-4" />
            )
          }
        />
        <ToolButton
          label={showGrid ? "Ocultar grade" : "Mostrar grade"}
          active={showGrid}
          onClick={onToggleGrid}
          icon={<Grid3x3 className="size-4" />}
        />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <div className="hidden items-center gap-2 pl-1 pr-3 sm:flex">
          <Sun className="size-4 text-muted-foreground" />
          <input
            type="range"
            min={0.2}
            max={2}
            step={0.05}
            value={lightIntensity}
            onChange={(e) => onLight(Number(e.target.value))}
            aria-label="Intensidade da luz"
            className="h-1.5 w-24 cursor-pointer accent-accent"
          />
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-secondary",
      )}
    >
      {icon}
    </button>
  );
}
