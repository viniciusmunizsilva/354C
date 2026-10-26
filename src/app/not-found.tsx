import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-6xl text-muted-foreground">404</p>
      <h1 className="mt-4 font-display text-2xl">Projeto não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        O ambiente que você procura não existe ou foi removido.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/projetos">Voltar à galeria</Link>
      </Button>
    </div>
  );
}
