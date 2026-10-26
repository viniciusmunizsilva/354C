"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Image as ImageIcon, Layers, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { FileDropzone } from "./file-dropzone";
import {
  CATEGORIES,
  COVER_EXTENSIONS,
  MODEL_EXTENSIONS,
  MTL_EXTENSIONS,
  TEXTURE_EXTENSIONS,
} from "@/lib/constants";
import {
  detectModelFormat,
  sniffMismatch,
  validateUploadSet,
} from "@/lib/validation";
import { uploadProjectAssets } from "@/lib/upload-project";
import {
  replaceModelAction,
  updateCoverAction,
  updateProjectMetaAction,
} from "@/app/projetos/actions";
import type { Project } from "@/lib/types";

const DEP_ACCEPT = [...MTL_EXTENSIONS, ...TEXTURE_EXTENSIONS].join(",");

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <MetaSection project={project} onSaved={() => router.refresh()} />
      <ModelSection project={project} onSaved={() => router.refresh()} />
      <CoverSection project={project} onSaved={() => router.refresh()} />
    </div>
  );
}

function MetaSection({
  project,
  onSaved,
}: {
  project: Project;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [category, setCategory] = useState(project.category);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateProjectMetaAction({
      id: project.id,
      title,
      description,
      category,
    });
    setSaving(false);
    if (result.ok) {
      toast({ title: "Projeto atualizado" });
      onSaved();
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.error });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações</CardTitle>
        <CardDescription>Título, descrição e categoria.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Nome do projeto *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Descrição</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            <Save className="size-4" />
            {saving ? "Salvando…" : "Salvar informações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ModelSection({
  project,
  onSaved,
}: {
  project: Project;
  onSaved: () => void;
}) {
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [depFiles, setDepFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  async function replace(e: React.FormEvent) {
    e.preventDefault();
    const model = modelFiles[0] ?? null;
    if (!model) {
      setErrors(["Selecione o novo arquivo de modelo."]);
      return;
    }

    const base = validateUploadSet({ model, dependencies: depFiles, cover: null });
    const allErrors = [...base.errors];
    for (const f of [model, ...depFiles]) {
      const mismatch = await sniffMismatch(f);
      if (mismatch) allErrors.push(mismatch);
    }
    setErrors(allErrors);
    if (allErrors.length > 0) return;

    const format = detectModelFormat(model.name);
    if (!format) {
      setErrors(["Formato de modelo não reconhecido."]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setProgress(0);
    try {
      const uploaded = await uploadProjectAssets({
        projectId: project.id,
        model,
        dependencies: depFiles,
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (!uploaded.model) throw new Error("Falha ao enviar o modelo.");

      const result = await replaceModelAction({
        projectId: project.id,
        modelFormat: format,
        model: uploaded.model,
        dependencies: uploaded.dependencies,
      });
      if (!result.ok) {
        setErrors([result.error]);
        return;
      }
      toast({ title: "Modelo substituído" });
      setModelFiles([]);
      setDepFiles([]);
      onSaved();
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (!aborted) {
        setErrors([err instanceof Error ? err.message : "Falha no envio."]);
      }
    } finally {
      setBusy(false);
      setProgress(0);
      abortRef.current = null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Substituir modelo</CardTitle>
        <CardDescription>
          Envie um novo modelo e suas dependências. Os arquivos anteriores que
          não forem mais necessários serão removidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={replace} className="space-y-4">
          <FileDropzone
            label="Novo modelo (OBJ ou FBX)"
            accept={MODEL_EXTENSIONS.join(",")}
            files={modelFiles}
            onChange={setModelFiles}
            icon={<Box className="size-5" />}
            disabled={busy}
          />
          <FileDropzone
            label="Novas dependências (MTL e texturas)"
            accept={DEP_ACCEPT}
            multiple
            files={depFiles}
            onChange={setDepFiles}
            icon={<Layers className="size-5" />}
            disabled={busy}
          />
          {errors.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          ) : null}
          {busy ? (
            <Progress value={progress} indeterminate={progress === 100} />
          ) : null}
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? `Enviando… ${progress}%` : "Substituir modelo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CoverSection({
  project,
  onSaved,
}: {
  project: Project;
  onSaved: () => void;
}) {
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function update(e: React.FormEvent) {
    e.preventDefault();
    const cover = coverFiles[0] ?? null;
    if (!cover) {
      setErrors(["Selecione uma imagem de capa."]);
      return;
    }
    const base = validateUploadSet({ model: null, dependencies: [], cover });
    // model is required by validateUploadSet; ignore that specific error here.
    const relevant = base.errors.filter((e) => !e.includes("modelo"));
    const mismatch = await sniffMismatch(cover);
    if (mismatch) relevant.push(mismatch);
    setErrors(relevant);
    if (relevant.length > 0) return;

    setBusy(true);
    setProgress(0);
    try {
      const uploaded = await uploadProjectAssets({
        projectId: project.id,
        cover,
        onProgress: setProgress,
      });
      if (!uploaded.cover) throw new Error("Falha ao enviar a capa.");
      const result = await updateCoverAction({
        id: project.id,
        cover: uploaded.cover,
        previousCoverPath: project.cover_storage_path,
      });
      if (!result.ok) {
        setErrors([result.error]);
        return;
      }
      toast({ title: "Capa atualizada" });
      setCoverFiles([]);
      onSaved();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Falha no envio."]);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagem de capa</CardTitle>
        <CardDescription>
          {project.cover_storage_path
            ? "Substitua a miniatura exibida na galeria."
            : "Adicione uma miniatura para a galeria."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={update} className="space-y-4">
          <FileDropzone
            label="Imagem de capa"
            accept={COVER_EXTENSIONS.join(",")}
            files={coverFiles}
            onChange={setCoverFiles}
            icon={<ImageIcon className="size-5" />}
            disabled={busy}
          />
          {errors.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          ) : null}
          {busy ? <Progress value={progress} /> : null}
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? `Enviando… ${progress}%` : "Atualizar capa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
