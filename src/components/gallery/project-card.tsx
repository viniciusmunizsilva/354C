import Link from "next/link";
import { Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/constants";
import type { ProjectListItem } from "@/lib/data";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/projetos/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {project.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverUrl}
            alt={`Capa de ${project.title}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#ffffff,#e8e5de)]">
            <Box
              className="size-10 text-muted-foreground/50"
              strokeWidth={1.25}
            />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="accent" className="uppercase tracking-wide">
            {project.model_format}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug tracking-tight">
            {project.title}
          </h3>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>{categoryLabel(project.category)}</span>
          <span>{formatDate(project.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}
