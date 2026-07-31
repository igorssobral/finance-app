import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Você está offline</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sem conexão no momento. Os dados já visitados continuam disponíveis;
          ações que exigem salvar serão sincronizadas assim que a conexão voltar.
        </p>
      </div>
    </div>
  );
}
