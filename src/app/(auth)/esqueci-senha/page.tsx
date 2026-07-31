import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">Recuperação de senha</h2>
      <p className="text-sm text-muted-foreground">
        Este fluxo (envio de e-mail com link de redefinição) será implementado
        junto com as configurações de segurança do perfil.
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Voltar para o login</Link>
      </Button>
    </div>
  );
}
