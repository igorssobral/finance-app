import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Crie sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Comece a organizar suas finanças em minutos
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
