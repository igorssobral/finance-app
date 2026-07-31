"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getCsrfToken } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    clearErrors("root");

    const csrfToken = await getCsrfToken();
    const result = await signIn("credentials", {
      ...data,
      csrfToken: csrfToken ?? undefined,
      redirect: false,
    });

    if (result?.error) {
      setError("root", {
        type: "server",
        message: "E-mail ou senha incorretos. Tente novamente.",
      });
      toast.error("E-mail ou senha incorretos");
      return;
    }

    toast.success("Login realizado com sucesso");
    router.replace(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link
            href="/esqueci-senha"
            className="text-xs text-primary hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-xs text-destructive">{errors.root.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Entrar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
