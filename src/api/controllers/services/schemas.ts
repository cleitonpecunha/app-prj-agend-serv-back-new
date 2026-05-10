import { z } from "zod";

export const createServiceSchema = z.object({
  providerId: z.coerce
    .number()
    .int("providerId deve ser um número inteiro.")
    .positive("providerId deve ser um número inteiro positivo."),
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro.")
    .positive("Duração deve ser um número inteiro positivo."),
  price: z.number().positive("Preço deve ser um número positivo."),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro.")
    .positive("Duração deve ser um número inteiro positivo."),
  price: z.number().positive("Preço deve ser um número positivo."),
  isActive: z.boolean(),
});

export const serviceParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser um número inteiro positivo."),
});

export const providerServicesParamsSchema = z.object({
  providerId: z.coerce
    .number()
    .int("providerId deve ser um número inteiro.")
    .positive("providerId deve ser um número inteiro positivo."),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceParams = z.infer<typeof serviceParamsSchema>;
export type ProviderServicesParams = z.infer<
  typeof providerServicesParamsSchema
>;
