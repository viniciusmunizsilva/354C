import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProjectWithAssets } from "@/lib/data";
import { EditProjectForm } from "@/components/project/edit-project-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar projeto" };

export default async function EditarProjetoPage(
  props: PageProps<"/projetos/[id]/editar">,
) {
  if (!isSupabaseConfigured()) redirect("/projetos");

  const { id } = await props.params;
  const project = await getProjectWithAssets(id);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href={`/projetos/${project.id}`}
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao projeto
      </Link>

      <h1 className="mb-8 font-display text-4xl tracking-tight">
        Editar projeto
      </h1>

      <EditProjectForm project={project} />
    </div>
  );
}
