import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

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

async function main() {
  const passwordHash = await hashPassword("Demo@12345");

  const user = await prisma.user.upsert({
    where: { email: "demo@financeapp.com" },
    update: {},
    create: {
      name: "Usuário Demo",
      email: "demo@financeapp.com",
      passwordHash,
      role: "ADMIN",
      currency: "BRL",
      locale: "pt-BR",
    },
  });

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: category.name } },
      update: {},
      create: {
        userId: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        isDefault: true,
      },
    });
  }

  await prisma.account.upsert({
    where: { id: `${user.id}-conta-principal` },
    update: {},
    create: {
      id: `${user.id}-conta-principal`,
      userId: user.id,
      name: "Conta Principal",
      type: "CHECKING",
      bank: "Banco Demo",
      initialBalance: 5000,
      color: "#10b981",
      icon: "landmark",
    },
  });

  console.log(`Seed concluído para ${user.email} (senha: Demo@12345)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
