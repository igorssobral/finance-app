import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { ProfileInput } from "@/lib/validations/profile";
import type { ChangePasswordInput } from "@/lib/validations/auth";

export async function updateProfileWithAudit(userId: string, data: ProfileInput) {
  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, currency: true, locale: true, timezone: true },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: sanitizeText(data.name),
      image: data.image || null,
      currency: data.currency,
      locale: data.locale,
      timezone: data.timezone,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "User",
      entityId: userId,
      action: "UPDATE",
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: { name: user.name, image: user.image, currency: user.currency, locale: user.locale, timezone: user.timezone },
    },
  });

  return user;
}

export async function changePasswordWithAudit(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user?.passwordHash) {
    throw new Error("Esta conta não usa senha local (login social)");
  }

  const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Senha atual incorreta");
  }

  const newHash = await hashPassword(data.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  // Nunca gravamos hash de senha no AuditLog — só o fato de que ocorreu a troca
  await prisma.auditLog.create({
    data: { userId, entity: "User", entityId: userId, action: "UPDATE", after: { passwordChanged: true } },
  });
}
