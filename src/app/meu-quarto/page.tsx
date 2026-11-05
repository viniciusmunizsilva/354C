import Link from "next/link";
import { ArrowLeft, Maximize2, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Meu quarto — Dormitório 2 (Layout C)" };

const ROOM_URL = "/quarto-3d/index.html";
const PLAN_URL = "/quarto-3d/planta-original.png";

export default function MeuQuartoPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8">
      <Link
        href="/projetos"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar à galeria
      </Link>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              Meu quarto
            </h1>
            <Badge variant="accent" className="uppercase">
              3D
            </Badge>
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Dormitório 2 · Layout C — estudo volumétrico com medidas reais (cama,
            mesa em L, TV, guarda-roupa, estante e área de música).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={ROOM_URL} target="_blank" rel="noopener noreferrer">
              <Maximize2 className="size-4" />
              Abrir em tela cheia
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href={PLAN_URL} target="_blank" rel="noopener noreferrer">
              <Map className="size-4" />
              Ver planta
            </a>
          </Button>
        </div>
      </div>

      <div className="h-[62vh] overflow-hidden rounded-xl border border-border bg-[#161826] shadow-sm sm:h-[74vh]">
        <iframe
          src={ROOM_URL}
          title="Modelo 3D do quarto — Dormitório 2, Layout C"
          className="size-full border-0"
          allow="fullscreen"
          loading="lazy"
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Arraste para girar · roda do mouse para aproximar/afastar · botão direito
        para mover. No canto da cena há um resumo das medidas e botões para
        exportar o modelo em GLB ou OBJ.
      </p>
    </div>
  );
}
