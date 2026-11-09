import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-medium tracking-tight sm:text-2xl">
            354c
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
            Ambientes 3D
          </span>
        </Link>
      </div>
    </header>
  );
}
