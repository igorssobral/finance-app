import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter ao menos 2 caracteres")
      .max(80, "Nome muito longo"),
    email: z.string().email("E-mail inválido").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .max(72, "Senha muito longa")
      .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase().trim(),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter ao menos um número"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
