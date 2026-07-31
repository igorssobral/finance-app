import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Bem-vindo de volta</h2>
        <p className="text-sm text-muted-foreground">
          Entre com suas credenciais para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
