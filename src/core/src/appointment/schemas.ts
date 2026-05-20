import { DATE_REGEX, TIME_REGEX } from "../shared/validregex";
import { isValidDateOnlyString } from "../shared/libs";
import { z } from "zod";

const timeString = (fieldLabel: string) =>
  z.string().regex(TIME_REGEX, `${fieldLabel} inválido. Use o formato HH:MM.`);

const appointmentDateString = z
  .string()
  .regex(DATE_REGEX, "Data do agendamento inválida. Use o formato YYYY-MM-DD.")
  .refine(isValidDateOnlyString, {
    message: "Data do agendamento inválida.",
  });

export const addAppointmentSchema = z.object({
  appointmentDate: appointmentDateString,
  startTime: timeString("Horário inicial"),
  clientName: z
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
  clientEmail: z
    .string()
    .trim()
    .min(1, {
      message: "E-mail é obrigatório.",
    })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Informe um e-mail válido",
    }),
  clientPhone: z
    .string()
    .trim()
    .refine((val) => !val || /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/.test(val), {
      message: "Formato do telefone inválido. Use: +55 (11) 12345-1234",
    }),
  notes: z.string().trim().optional(),
});

export const appointmentParamsSchema = z.object({
  id: z.string().min(1, "ID do agendamento é obrigatório."),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["completed", "canceled", "no_show"], {
    error: "Status inválido para atualização.",
  }),
});

export type AddAppointmentInput = z.infer<typeof addAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
export type AppointmentParams = z.infer<typeof appointmentParamsSchema>;
