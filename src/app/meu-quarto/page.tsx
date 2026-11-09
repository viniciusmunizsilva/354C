import Link from "next/link";
import { ArrowLeft, Map, Download, Box as BoxIcon, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RoomViewer } from "@/components/room-viewer";

export const metadata = { title: "Quarto Vinicius — Dormitório 2 (Layout C)" };

const ROOM_URL = "/quarto-3d/index.html";
const PLAN_URL = "/quarto-3d/planta.html";
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
        href="/"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao início
      </Link>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Quarto Vinicius
          </h1>
          <Badge variant="accent" className="uppercase">
            3D · Planta
          </Badge>
        </div>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Dormitório 2 · Layout C — modelo 3D e planta baixa cotada, com as
          medidas reais do ambiente.
        </p>
      </div>

      <RoomViewer threeUrl={ROOM_URL} planUrl={PLAN_URL} />

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
            href={PLAN_PDF}
            download
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <Map className="mt-0.5 size-5 text-muted-foreground" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                Planta original (PDF) <Download className="size-3.5" />
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
