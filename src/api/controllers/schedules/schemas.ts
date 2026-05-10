import { z } from "zod";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayOfWeekEnum = z.enum(
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
  { error: "Dia da semana inválido." },
);

const timeString = (fieldLabel: string) =>
  z.string().regex(TIME_REGEX, `${fieldLabel} inválido. Use o formato HH:MM.`);

export const createScheduleSchema = z
  .object({
    dayOfWeek: dayOfWeekEnum,
    startTime: timeString("Horário inicial"),
    endTime: timeString("Horário final"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "O horário inicial deve ser menor que o horário final.",
    path: ["startTime"],
  });

export const updateScheduleSchema = z
  .object({
    dayOfWeek: dayOfWeekEnum,
    startTime: timeString("Horário inicial"),
    endTime: timeString("Horário final"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "O horário inicial deve ser menor que o horário final.",
    path: ["startTime"],
  });

export const scheduleParamsSchema = z.object({
  id: z.coerce
    .number()
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser um número inteiro positivo."),
});

export const providerSchedulesParamsSchema = z.object({
  providerId: z.coerce
    .number()
    .int("providerId deve ser um número inteiro.")
    .positive("providerId deve ser um número inteiro positivo."),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ScheduleParams = z.infer<typeof scheduleParamsSchema>;
export type ProviderSchedulesParams = z.infer<
  typeof providerSchedulesParamsSchema
>;
