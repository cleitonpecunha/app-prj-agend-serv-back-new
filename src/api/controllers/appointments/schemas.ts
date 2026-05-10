import { z } from "zod";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnlyString(value: string) {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const timeString = (fieldLabel: string) =>
  z.string().regex(TIME_REGEX, `${fieldLabel} inválido. Use o formato HH:MM.`);

const appointmentDateString = z
  .string()
  .regex(DATE_REGEX, "Data do agendamento inválida. Use o formato YYYY-MM-DD.")
  .refine(isValidDateOnlyString, {
    message: "Data do agendamento inválida.",
  });

export const createAppointmentSchema = z.object({
  appointmentDate: appointmentDateString,
  startTime: timeString("Horário inicial"),
  clientName: z.string().trim().min(1, "Nome do cliente é obrigatório."),
  clientEmail: z.string().email("E-mail do cliente inválido."),
  clientPhone: z.string().trim().min(8, "Telefone do cliente é obrigatório."),
  notes: z.string().trim().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["completed", "canceled", "no_show"], {
    error: "Status inválido para atualização.",
  }),
});

export const appointmentParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser um número inteiro positivo."),
});

export const providerAppointmentsParamsSchema = z.object({
  providerId: z.coerce
    .number()
    .int("providerId deve ser um número inteiro.")
    .positive("providerId deve ser um número inteiro positivo."),
});

export const serviceAppointmentsParamsSchema = z.object({
  serviceId: z.coerce
    .number()
    .int("serviceId deve ser um número inteiro.")
    .positive("serviceId deve ser um número inteiro positivo."),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
export type AppointmentParams = z.infer<typeof appointmentParamsSchema>;
export type ProviderAppointmentsParams = z.infer<
  typeof providerAppointmentsParamsSchema
>;
export type ServiceAppointmentsParams = z.infer<
  typeof serviceAppointmentsParamsSchema
>;
