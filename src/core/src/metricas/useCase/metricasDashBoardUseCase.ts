import { NotFoundError } from "@/lib/errors";
import { IAppointmentsRepository } from "../../appointment/repositories/IAppointmentsRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { AppointmentStatus } from "@/generated/prisma/enums";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function currentMonthString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export class MetricasDashBoardUseCase {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
  ) {}

  async execute(auth: { userId: string }, month?: string) {
    const referenceMonth = month ?? currentMonthString();
    const [yearStr, monthStr] = referenceMonth.split("-");
    const year = Number(yearStr);
    const monthNum = Number(monthStr);

    // TODO: Otimizar para não buscar todos os agendamentos do mês, mas sim apenas os dados necessários para o dashboard
    const [existingAppointments] = await Promise.all([
      this.appointmentsRepository.findManyByUserIdAndMonth(
        auth.userId,
        year,
        monthNum,
      ),
    ]);

    if (!existingAppointments) {
      throw new NotFoundError(
        MensagensPadronizadas.AGENDAMENTOS_NAO_ENCONTRADOS,
      );
    }

    let scheduledCount = 0;
    let completedCount = 0;
    let canceledCount = 0;
    let noShowCount = 0;
    let scheduledRevenue = 0;
    let completedRevenue = 0;

    for (const apt of existingAppointments) {
      const price = Number(apt.service.priceInCents) / 100;
      switch (apt.status) {
        case AppointmentStatus.scheduled:
          scheduledCount++;
          scheduledRevenue += price;
          break;
        case AppointmentStatus.completed:
          completedCount++;
          completedRevenue += price;
          break;
        case AppointmentStatus.canceled:
          canceledCount++;
          break;
        case AppointmentStatus.no_show:
          noShowCount++;
          break;
      }
    }

    const finishedCount = completedCount + noShowCount;

    const attendanceRate =
      finishedCount > 0
        ? Math.round((completedCount / finishedCount) * 10000) / 100
        : null;

    const todayStr = new Date().toISOString().slice(0, 10);

    const nextAppointments = existingAppointments
      .filter(
        (a) =>
          a.status === AppointmentStatus.scheduled &&
          toDateString(a.appointmentDate) >= todayStr,
      )
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        appointmentDate: toDateString(a.appointmentDate),
        startTime: a.startTime,
        status: a.status,
        clientName: a.clientName,
        serviceId: a.serviceId,
        serviceName: a.service.name,
      }));

    return {
      referenceMonth,
      totalAppointments: existingAppointments.length,
      scheduledAppointments: scheduledCount,
      completedAppointments: completedCount,
      canceledAppointments: canceledCount,
      noShowAppointments: noShowCount,
      attendanceRate,
      scheduledRevenue: Math.round(scheduledRevenue * 100) / 100,
      completedRevenue: Math.round(completedRevenue * 100) / 100,
      nextAppointments,
    };
  }
}
