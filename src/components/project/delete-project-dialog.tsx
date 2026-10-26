"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { deleteProjectAndRedirect } from "@/app/projetos/actions";

export function DeleteProjectDialog({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProjectAndRedirect(projectId);
      } catch (err) {
        // redirect() throws internally on success; only surface real errors.
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          return;
        }
        toast({
          variant: "destructive",
          title: "Falha ao excluir",
          description: "Não foi possível excluir o projeto. Tente novamente.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
          <Trash2 className="size-4" />
          Excluir projeto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir projeto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{title}</span>? Esta
            ação é permanente e remove o modelo e todos os arquivos
            relacionados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Excluindo…" : "Excluir definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
