import { z } from "zod";

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const createProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  businessName: z.string().min(1, "Nome do negócio é obrigatório."),
  email: z.email("E-mail inválido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
  phone: z.string().min(1, "Telefone é obrigatório."),
  address: z.string().min(1, "Endereço é obrigatório."),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  businessName: z.string().min(1, "Nome do negócio é obrigatório."),
  email: z.email("E-mail inválido."),
  phone: z.string().min(1, "Telefone é obrigatório."),
  address: z.string().min(1, "Endereço é obrigatório."),
});

export const providerParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser um número inteiro positivo."),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ProviderParams = z.infer<typeof providerParamsSchema>;

export const revenueQuerySchema = z.object({
  month: z.string().regex(MONTH_REGEX, "Mês inválido. Use o formato YYYY-MM."),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const dashboardQuerySchema = z.object({
  month: z
    .string()
    .regex(MONTH_REGEX, "Mês inválido. Use o formato YYYY-MM.")
    .optional(),
});

export type RevenueQuery = z.infer<typeof revenueQuerySchema>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
