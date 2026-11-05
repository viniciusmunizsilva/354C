import Link from "next/link";
import {
  ArrowLeft,
  Maximize2,
  Map,
  Download,
  Box as BoxIcon,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Meu quarto — Dormitório 2 (Layout C)" };

const ROOM_URL = "/quarto-3d/index.html";
const PLAN_PNG = "/quarto-3d/planta-original.png";
const PLAN_PDF = "/quarto-3d/planta-original.pdf";
const OBJ_URL = "/models/dormitorio2-layoutC.obj";
const MTL_URL = "/models/dormitorio2-layoutC.mtl";

const MEASURES: Array<[string, string]> = [
  ["Parede da janela", "3,80 m"],
  ["Profundidade", "3,00 m"],
  ["Parede da porta", "3,35 m"],
  ["Pé-direito", "2,65 m*"],
];

const NOTES = [
  "Confirmar as medidas do quarto presencialmente antes da fabricação.",
  "Definir espessuras do MDF, fundos, fitas de borda e ferragens.",
  "Guarda-roupa com 2 portas de correr (0,75 m cada) — nenhuma folha avança na passagem.",
  "Conferir abertura de porta, tomadas, rodapés e interferências.",
  "Itens marcados com * são assumidos/aproximados e precisam de conferência no local.",
];

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
            <a href={PLAN_PDF} target="_blank" rel="noopener noreferrer">
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

      {/* Medidas gerais */}
      <section className="mt-10">
        <h2 className="font-display text-xl tracking-tight">Medidas gerais</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MEASURES.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-medium">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads */}
      <section className="mt-10">
        <h2 className="font-display text-xl tracking-tight">
          Arquivos para o marceneiro
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <a
            href={OBJ_URL}
            download
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <BoxIcon className="mt-0.5 size-5 text-muted-foreground" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                Modelo OBJ <Download className="size-3.5" />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Geometria 3D. Baixe junto com o MTL.
              </span>
            </span>
          </a>
          <a
            href={MTL_URL}
            download
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <FileText className="mt-0.5 size-5 text-muted-foreground" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                Materiais MTL <Download className="size-3.5" />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Materiais do OBJ (mesma pasta).
              </span>
            </span>
          </a>
          <a
            href={PLAN_PNG}
            download
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <Map className="mt-0.5 size-5 text-muted-foreground" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                Planta original <Download className="size-3.5" />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Planta arquitetônica de referência.
              </span>
            </span>
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Para GLB, use o botão “Download GLB” na barra do visualizador acima.
        </p>
      </section>

      {/* Observações */}
      <section className="mt-10">
        <h2 className="font-display text-xl tracking-tight">
          Observações para o marceneiro
        </h2>
        <ul className="mt-4 space-y-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          {NOTES.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Estudo preliminar · material para apresentação e orçamento · medidas
          sujeitas à conferência no local.
        </p>
      </section>
    </div>
  );
}
