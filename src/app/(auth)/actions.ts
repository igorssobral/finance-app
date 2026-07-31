"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const DEFAULT_CATEGORIES = [
  { name: "Alimentação", color: "#f59e0b", icon: "utensils" },
  { name: "Transporte", color: "#3b82f6", icon: "car" },
  { name: "Saúde", color: "#ef4444", icon: "heart-pulse" },
  { name: "Educação", color: "#8b5cf6", icon: "graduation-cap" },
  { name: "Mercado", color: "#10b981", icon: "shopping-cart" },
  { name: "Lazer", color: "#ec4899", icon: "party-popper" },
  { name: "Moradia", color: "#6366f1", icon: "home" },
  { name: "Compras", color: "#f97316", icon: "shopping-bag" },
  { name: "Streaming", color: "#a855f7", icon: "tv" },
  { name: "Viagem", color: "#06b6d4", icon: "plane" },
  { name: "Investimentos", color: "#10b981", icon: "trending-up" },
  { name: "Salário", color: "#22c55e", icon: "banknote" },
  { name: "Freelance", color: "#14b8a6", icon: "briefcase" },
  { name: "Outros", color: "#71717a", icon: "shapes" },
] as const;

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  // Server Actions não recebem IP diretamente — usamos o header repassado pelo proxy/Next
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!success) {
    return { success: false, error: "Muitas tentativas. Tente novamente em instantes." };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "E-mail já cadastrado",
      fieldErrors: { email: ["Este e-mail já está em uso"] },
    };
  }

  const passwordHash = await hashPassword(password);
  const sanitizedName = sanitizeText(name);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: sanitizedName,
        email,
        passwordHash,
        role: "USER",
      },
    });

    // Todo novo usuário já começa com as categorias padrão do sistema
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        ...category,
        userId: user.id,
        isDefault: true,
      })),
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        entity: "User",
        entityId: user.id,
        action: "CREATE",
        after: { name: sanitizedName, email },
      },
    });
  });

  return { success: true };
}
