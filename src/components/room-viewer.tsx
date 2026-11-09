"use client";

import { useState } from "react";
import { Box, Map, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Mode = "3d" | "plan";

export function RoomViewer({
  threeUrl,
  planUrl,
}: {
  threeUrl: string;
  planUrl: string;
}) {
  const [mode, setMode] = useState<Mode>("3d");
  const url = mode === "3d" ? threeUrl : planUrl;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Modo de visualização"
          className="inline-flex rounded-full border border-border bg-card p-1"
        >
          <Tab active={mode === "3d"} onClick={() => setMode("3d")}>
            <Box className="size-4" />
            Modelo 3D
          </Tab>
          <Tab active={mode === "plan"} onClick={() => setMode("plan")}>
            <Map className="size-4" />
            Planta
          </Tab>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Maximize2 className="size-4" />
            <span className="hidden sm:inline">Tela cheia</span>
          </a>
        </Button>
      </div>

      <div className="h-[58vh] overflow-hidden rounded-xl border border-border bg-[#161826] shadow-sm sm:h-[74vh]">
        <iframe
          key={mode}
          src={url}
          title={mode === "3d" ? "Modelo 3D do quarto" : "Planta baixa do quarto"}
          className="size-full border-0"
          allow="fullscreen"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {mode === "3d"
          ? "Arraste para girar · pinça/roda para aproximar · dois dedos para mover. Use os botões no canto para trocar o enquadramento e mostrar/ocultar as paredes."
          : "Planta baixa cotada com a lista de móveis e medidas. Role para ver a elevação da parede da TV e as folgas de circulação."}
      </p>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors sm:px-4",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
