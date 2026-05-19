import { z } from "zod";

export const addServiceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório."),
  description: z.string().min(1, "Descrição do serviço é obrigatória."),
  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro.")
    .positive("Duração do serviço deve ser maior que zero."),
  priceInCents: z.number().min(1, {
    message: "Valor do serviço deve ser maior que zero.",
  }),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório."),
  description: z.string().min(1, "Descrição do serviço é obrigatória."),
  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro.")
    .positive("Duração do serviço deve ser maior que zero."),
  priceInCents: z.number().min(1, {
    message: "Valor do serviço deve ser maior que zero.",
  }),
  isActive: z.boolean(),
});

export const serviceParamsSchema = z.object({
  id: z.string().min(1, "ID do serviço é obrigatório."),
});

export type AddServiceInput = z.infer<typeof addServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceParams = z.infer<typeof serviceParamsSchema>;
