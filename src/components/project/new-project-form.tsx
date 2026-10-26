"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, FileBox, Image as ImageIcon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  MODEL_EXTENSIONS,
  TEXTURE_EXTENSIONS,
  MTL_EXTENSIONS,
  COVER_EXTENSIONS,
} from "@/lib/constants";
import { validateUploadSet, sniffMismatch, detectModelFormat } from "@/lib/validation";
import { uploadProjectAssets } from "@/lib/upload-project";
import {
  createProjectAction,
  discardUploadsAction,
} from "@/app/projetos/actions";

const MODEL_ACCEPT = MODEL_EXTENSIONS.join(",");
const DEP_ACCEPT = [...MTL_EXTENSIONS, ...TEXTURE_EXTENSIONS].join(",");
const COVER_ACCEPT = COVER_EXTENSIONS.join(",");

type Phase = "idle" | "uploading" | "saving";

export function NewProjectForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [depFiles, setDepFiles] = useState<File[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const busy = phase !== "idle";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const model = modelFiles[0] ?? null;
    const cover = coverFiles[0] ?? null;

    const base = validateUploadSet({ model, dependencies: depFiles, cover });
    const allErrors = [...base.errors];
    const allWarnings = [...base.warnings];

    // Magic-byte sniff (do not trust the extension alone).
    for (const file of [model, ...depFiles, cover].filter(Boolean) as File[]) {
      const mismatch = await sniffMismatch(file);
      if (mismatch) allErrors.push(mismatch);
    }

    if (!title.trim()) allErrors.unshift("Informe um título para o projeto.");

    setErrors(allErrors);
    setWarnings(allWarnings);
    if (allErrors.length > 0 || !model) return;

    const format = detectModelFormat(model.name);
    if (!format) {
      setErrors(["Formato de modelo não reconhecido."]);
      return;
    }

    const projectId = crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setPhase("uploading");
      setProgress(0);

      const uploaded = await uploadProjectAssets({
        projectId,
        model,
        dependencies: depFiles,
        cover,
        signal: controller.signal,
        onProgress: setProgress,
      });

      if (!uploaded.model) throw new Error("Falha ao enviar o modelo.");

      setPhase("saving");
      const result = await createProjectAction({
        projectId,
        title,
        description,
        category,
        modelFormat: format,
        model: uploaded.model,
        dependencies: uploaded.dependencies,
        cover: uploaded.cover ?? null,
      });

      if (!result.ok) {
        setErrors([result.error]);
        setPhase("idle");
        return;
      }

      toast({ title: "Projeto criado", description: title });
      router.push(`/projetos/${result.id}`);
    } catch (err) {
      await discardUploadsAction(projectId).catch(() => {});
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      if (!aborted) {
        setErrors([
          err instanceof Error ? err.message : "Falha no envio dos arquivos.",
        ]);
      }
      setPhase("idle");
      setProgress(0);
    } finally {
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Nome do projeto *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Suíte master com varanda"
            maxLength={160}
            disabled={busy}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do ambiente, dimensões, referências…"
            maxLength={4000}
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory} disabled={busy}>
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
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="font-display text-xl">Arquivos do modelo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Envie o modelo principal (.obj ou .fbx) e seus arquivos
            dependentes. Para OBJ, inclua o .mtl e as texturas; para FBX,
            inclua as texturas referenciadas.
          </p>
        </div>

        <FileDropzone
          label="Modelo principal (OBJ ou FBX)"
          hint="Arraste ou clique para selecionar um arquivo .obj ou .fbx"
          accept={MODEL_ACCEPT}
          files={modelFiles}
          onChange={setModelFiles}
          icon={<Box className="size-5" />}
          disabled={busy}
        />

        <FileDropzone
          label="Dependências (MTL e texturas)"
          hint="Opcional — arraste vários arquivos de uma vez"
          accept={DEP_ACCEPT}
          multiple
          files={depFiles}
          onChange={setDepFiles}
          icon={<Layers className="size-5" />}
          disabled={busy}
        />

        <FileDropzone
          label="Imagem de capa (opcional)"
          hint="PNG, JPG ou WEBP — usada como miniatura na galeria"
          accept={COVER_ACCEPT}
          files={coverFiles}
          onChange={setCoverFiles}
          icon={<ImageIcon className="size-5" />}
          disabled={busy}
        />
      </section>

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      ) : null}

      {errors.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.map((err, i) => (
            <li key={i}>• {err}</li>
          ))}
        </ul>
      ) : null}

      {busy ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {phase === "uploading"
                ? `Enviando arquivos… ${progress}%`
                : "Salvando projeto…"}
            </span>
            {phase === "uploading" ? (
              <button
                type="button"
                onClick={cancel}
                className="text-xs text-destructive hover:underline"
              >
                Cancelar
              </button>
            ) : null}
          </div>
          <Progress value={progress} indeterminate={phase === "saving"} />
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy} className="gap-2">
          <FileBox className="size-4" />
          {busy ? "Processando…" : "Criar projeto"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => router.push("/projetos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
