import { NotFoundError } from "@/lib/errors";
import { IAppointmentsRepository } from "../../appointment/repositories/IAppointmentsRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { AppointmentStatus } from "@/generated/prisma/enums";
import { RevenueQuery } from "../schema";
import { RevenueDTO } from "../dto/revenueDTO";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getBucketKey(dateStr: string, groupBy: string): string {
  if (groupBy === "week") {
    const day = new Date(`${dateStr}T00:00:00.000Z`).getUTCDate();
    return `week-${Math.ceil(day / 7)}`;
  }
  if (groupBy === "month") {
    return dateStr.slice(0, 7);
  }
  return dateStr;
}

function getBucketLabel(key: string, groupBy: string): string {
  if (groupBy === "week") {
    const weekNum = key.split("-")[1];
    return `Semana ${weekNum}`;
  }
  return key;
}

export class MetricasRevenueUseCase {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
  ) {}

  async execute(auth: { userId: string }, query: RevenueQuery) {
    const [yearStr, monthStr] = query.month.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    // TODO: Otimizar para não buscar todos os agendamentos do mês, mas sim apenas os dados necessários para o dashboard
    const [existingAppointments] = await Promise.all([
      this.appointmentsRepository.findManyByUserIdAndMonth(
        auth.userId,
        year,
        month,
      ),
    ]);

    if (!existingAppointments) {
      throw new NotFoundError(
        MensagensPadronizadas.AGENDAMENTOS_NAO_ENCONTRADOS,
      );
    }

    const bucketsMap = new Map<string, RevenueDTO>();

    for (const apt of existingAppointments) {
      if (
        apt.status !== AppointmentStatus.scheduled &&
        apt.status !== AppointmentStatus.completed
      ) {
        continue;
      }

      const dateStr = toDateString(apt.appointmentDate);
      const key = getBucketKey(dateStr, query.groupBy);
      const price = Number(apt.service.priceInCents) / 100;
      const isCompleted = apt.status === AppointmentStatus.completed;

      let bucket = bucketsMap.get(key);
      if (!bucket) {
        bucket = {
          label: getBucketLabel(key, query.groupBy),
          startDate: dateStr,
          endDate: dateStr,
          scheduledRevenue: 0,
          completedRevenue: 0,
          appointmentCount: 0,
        };
        bucketsMap.set(key, bucket);
      }

      if (isCompleted) {
        bucket.completedRevenue += price;
      } else {
        bucket.scheduledRevenue += price;
      }
      bucket.appointmentCount += 1;
      if (dateStr < bucket.startDate) bucket.startDate = dateStr;
      if (dateStr > bucket.endDate) bucket.endDate = dateStr;
    }

    const buckets = Array.from(bucketsMap.values())
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((b) => ({
        ...b,
        scheduledRevenue: Math.round(b.scheduledRevenue * 100) / 100,
        completedRevenue: Math.round(b.completedRevenue * 100) / 100,
      }));

    const summary = {
      scheduledRevenue:
        Math.round(buckets.reduce((s, b) => s + b.scheduledRevenue, 0) * 100) /
        100,
      completedRevenue:
        Math.round(buckets.reduce((s, b) => s + b.completedRevenue, 0) * 100) /
        100,
      totalAppointmentsConsidered: buckets.reduce(
        (s, b) => s + b.appointmentCount,
        0,
      ),
    };

    return {
      month: query.month,
      groupBy: query.groupBy,
      summary,
      buckets,
    };
  }
}
