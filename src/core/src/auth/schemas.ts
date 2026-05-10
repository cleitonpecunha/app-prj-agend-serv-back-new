import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, {
      message: "E-mail é obrigatório.",
    })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Informe um e-mail válido",
    }),
  passwordHash: z
    .string()
    .trim()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "A senha deve conter pelo menos uma letra maiúscula",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "A senha deve conter pelo menos uma letra minúscula",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "A senha deve conter pelo menos um número",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "A senha deve conter pelo menos um caracter especial",
    }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
