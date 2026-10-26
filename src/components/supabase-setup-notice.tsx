import { Database } from "lucide-react";

/**
 * Shown when NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are absent. The static UI
 * and the 3D viewer demo still work; the gallery and uploads need the backend.
 */
export function SupabaseSetupNotice() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
        <Database className="size-6 text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl">Backend ainda não configurado</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Defina as variáveis <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
        e <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e
        aplique as migrações em <code className="font-mono">supabase/migrations</code>{" "}
        para ativar a galeria e os uploads. Os passos estão no{" "}
        <code className="font-mono">README.md</code>.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Enquanto isso, o visualizador 3D funciona com o modelo de exemplo.
      </p>
    </div>
  );
}
