import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, Pencil, Layers } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProjectWithAssets, buildViewerPayload } from "@/lib/data";
import { categoryLabel } from "@/lib/constants";
import { ViewerCanvas } from "@/components/viewer/viewer-canvas";
import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjetoPage(props: PageProps<"/projetos/[id]">) {
  if (!isSupabaseConfigured()) redirect("/projetos");

  const { id } = await props.params;
  const project = await getProjectWithAssets(id);
  if (!project) notFound();

  const payload = await buildViewerPayload(project);
  const assetCount = project.assets.filter(
    (a) => a.asset_type === "mtl" || a.asset_type === "texture",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8">
      <Link
        href="/projetos"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar à galeria
      </Link>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="order-2 h-[58vh] lg:order-1 lg:h-[76vh]">
          {payload ? (
            <ViewerCanvas payload={payload} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
              O arquivo do modelo não pôde ser localizado no armazenamento.
            </div>
          )}
        </div>

        <aside className="order-1 space-y-6 lg:order-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="uppercase">
                {project.model_format}
              </Badge>
              <Badge variant="outline">{categoryLabel(project.category)}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight">
              {project.title}
            </h1>
            {project.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            ) : null}
          </div>

          <dl className="space-y-2.5 border-y border-border py-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <dt className="sr-only">Atualizado em</dt>
              <dd>
                Atualizado em{" "}
                {new Date(project.updated_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="size-4" />
              <dt className="sr-only">Dependências</dt>
              <dd>
                {assetCount}{" "}
                {assetCount === 1
                  ? "arquivo de dependência"
                  : "arquivos de dependência"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projetos/${project.id}/editar`}>
                <Pencil className="size-4" />
                Editar projeto
              </Link>
            </Button>
            <DeleteProjectDialog projectId={project.id} title={project.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
