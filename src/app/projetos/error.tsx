"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <h2 className="font-display text-2xl">Não foi possível carregar a galeria</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "Ocorreu um erro ao buscar seus projetos."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
