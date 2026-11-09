import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export const metadata = {
  title: "354c — Ambientes 3D",
  description: "Projetos de ambientes residenciais em 3D e planta baixa.",
};

type Room = {
  name: string;
  caption: string;
  href?: string;
  image?: string;
};

const ROOMS: Room[] = [
  {
    name: "Quarto Vinicius",
    caption: "Dormitório 2 · Layout C",
    href: "/meu-quarto",
    image: "/rooms/quarto-vinicius.png",
  },
  { name: "Em breve", caption: "Próximo ambiente" },
  { name: "Em breve", caption: "Próximo ambiente" },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 text-center sm:mb-12">
        <h1 className="font-display text-6xl tracking-tight sm:text-7xl">354c</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Escolha um ambiente para visualizar em 3D e em planta baixa.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((room, i) =>
          room.href ? (
            <li key={i}>
              <Link
                href={room.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={room.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div>
                    <h2 className="font-display text-lg leading-tight tracking-tight">
                      {room.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {room.caption}
                    </p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ) : (
            <li key={i}>
              <div className="flex h-full min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-transparent p-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground">
                  <Plus className="size-5" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {room.name}
                </p>
                <p className="text-xs text-muted-foreground/70">{room.caption}</p>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
