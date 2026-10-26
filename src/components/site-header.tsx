import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/projetos" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-lg leading-none"
          >
            R
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-medium tracking-tight">
              Room Gallery
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Ambientes 3D
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projetos">Galeria</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/projetos/novo">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo projeto</span>
              <span className="sm:hidden">Novo</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
