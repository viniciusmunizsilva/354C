import Link from "next/link";
import { Box } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span aria-hidden className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Box className="size-5"/></span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Projeto do dormitório</span>
            <span className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">Apresentação de marcenaria</span>
          </span>
        </Link>
        <span className="text-xs text-muted-foreground">Estudo preliminar · 3D</span>
      </div>
    </header>
  );
}
