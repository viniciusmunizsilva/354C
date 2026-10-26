"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "./project-card";
import { CATEGORIES } from "@/lib/constants";
import type { ProjectListItem } from "@/lib/data";

type SortKey = "updated_desc" | "updated_asc" | "title_asc";

export function GalleryClient({ projects }: { projects: ProjectListItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated_desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = projects.filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category === category;
      return matchesQuery && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === "title_asc") return a.title.localeCompare(b.title, "pt-BR");
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sort === "updated_asc" ? da - db : db - da;
    });
    return result;
  }, [projects, query, category, sort]);

  if (projects.length === 0) {
    return <EmptyGallery />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome…"
            className="pl-9"
            aria-label="Buscar projetos"
          />
        </div>

        <div className="flex gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[180px]" aria-label="Ordenar">
              <SlidersHorizontal className="mr-1 size-4 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Mais recentes</SelectItem>
              <SelectItem value="updated_asc">Mais antigos</SelectItem>
              <SelectItem value="title_asc">Nome (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum projeto corresponde à busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyGallery() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-secondary">
        <Plus className="size-7 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl">Sua galeria está vazia</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Adicione seu primeiro ambiente 3D para começar a organizar e visualizar
        seus modelos.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/projetos/novo">
          <Plus className="size-4" />
          Adicionar projeto
        </Link>
      </Button>
    </div>
  );
}
