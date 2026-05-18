import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Nome é obrigatório.",
    })
    .refine(
      (val) => {
        if (!val) return false;
        const parts = val.split(" ").filter(Boolean);
        if (parts.length < 2) return false;
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        return firstName!.length >= 4 && lastName!.length >= 3;
      },
      {
        message:
          "Informe nome e sobrenome. Primeiro nome mínimo 4 caracteres e sobrenome mínimo 3 caracteres.",
      },
    ),
  businessName: z
    .string()
    .trim()
    .min(1, {
      message: "Nome é obrigatório.",
    })
    .refine(
      (val) => {
        if (!val) return false;
        const parts = val.split(" ").filter(Boolean);
        if (parts.length < 2) return false;
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        return firstName!.length >= 4 && lastName!.length >= 2;
      },
      {
        message:
          "Informe nome do negócio. Primeiro nome mínimo 4 caracteres e o segundo mínimo 2 caracteres.",
      },
    ),
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
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/.test(val), {
      message: "Formato do telefone inválido. Use: +55 (11) 12345-1234",
    }),
  address: z.string().min(1, "Endereço é obrigatório."),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Nome é obrigatório.",
    })
    .refine(
      (val) => {
        if (!val) return false;
        const parts = val.split(" ").filter(Boolean);
        if (parts.length < 2) return false;
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        return firstName!.length >= 4 && lastName!.length >= 3;
      },
      {
        message:
          "Informe nome e sobrenome. Primeiro nome mínimo 4 caracteres e sobrenome mínimo 3 caracteres.",
      },
    ),
  businessName: z
    .string()
    .trim()
    .min(1, {
      message: "Nome é obrigatório.",
    })
    .refine(
      (val) => {
        if (!val) return false;
        const parts = val.split(" ").filter(Boolean);
        if (parts.length < 2) return false;
        const firstName = parts[0];
        const lastName = parts[parts.length - 1];
        return firstName!.length >= 4 && lastName!.length >= 2;
      },
      {
        message:
          "Informe nome do negócio. Primeiro nome mínimo 4 caracteres e o segundo mínimo 2 caracteres.",
      },
    ),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/.test(val), {
      message: "Formato do telefone inválido. Use: +55 (11) 12345-1234",
    }),
  address: z.string().min(1, "Endereço é obrigatório."),
});

export const userParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser um número inteiro positivo."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
