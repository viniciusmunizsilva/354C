import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listProjects } from "@/lib/data";
import { GalleryClient } from "@/components/gallery/gallery-client";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const configured = isSupabaseConfigured();
  const projects = configured ? await listProjects() : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Portfólio
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            Galeria de ambientes
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Modelos 3D de quartos, suítes e ambientes residenciais — visualize
            qualquer um deles diretamente no navegador.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/exemplo">
            Ver modelo de exemplo
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {configured ? (
        <GalleryClient projects={projects} />
      ) : (
        <SupabaseSetupNotice />
      )}
    </div>
  );
}
