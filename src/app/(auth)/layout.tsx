import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Glows de fundo sutis na paleta emerald/blue */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Finance App</h1>
          <p className="text-sm text-muted-foreground">
            Seu dinheiro, organizado com clareza
          </p>
        </div>

        <div className="glass rounded-xl p-8 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
