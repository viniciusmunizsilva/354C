import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ViewerCanvas } from "@/components/viewer/viewer-canvas";
import { Badge } from "@/components/ui/badge";
import type { ViewerPayload } from "@/lib/types";

export const metadata = { title: "Modelo de exemplo" };

const SAMPLE_PAYLOAD: ViewerPayload = {
  format: "obj",
  modelUrl: "/samples/room.obj",
  dependencyUrls: { "room.mtl": "/samples/room.mtl" },
};

export default function ExemploPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8">
      <Link
        href="/projetos"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar à galeria
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl tracking-tight">Quarto de exemplo</h1>
        <Badge variant="accent" className="uppercase">
          OBJ
        </Badge>
      </div>

      <div className="h-[62vh] sm:h-[72vh]">
        <ViewerCanvas payload={SAMPLE_PAYLOAD} />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Modelo procedural incluído no projeto. Use o mouse ou o toque para
        girar, aproximar e afastar; a barra inferior permite recentralizar a
        câmera, alternar a visualização superior, mostrar a grade e ajustar a
        iluminação.
      </p>
    </div>
  );
}
