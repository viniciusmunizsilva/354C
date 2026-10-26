import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NewProjectForm } from "@/components/project/new-project-form";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";

export const metadata = { title: "Novo projeto" };

export default function NovoProjetoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/projetos"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar à galeria
      </Link>

      <h1 className="font-display text-4xl tracking-tight">Novo projeto</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Armazene um novo ambiente 3D com seus materiais e texturas.
      </p>

      {isSupabaseConfigured() ? <NewProjectForm /> : <SupabaseSetupNotice />}
    </div>
  );
}
