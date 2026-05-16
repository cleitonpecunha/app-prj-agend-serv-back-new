import { z } from "zod";

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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
