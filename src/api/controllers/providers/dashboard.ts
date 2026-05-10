import { AppointmentStatus } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { appointmentRepository } from "../appointments/repository";
import { providerRepository } from "./repository";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function currentMonthString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getProviderDashboard(providerId: number, month?: string) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw new NotFoundError("Prestador");

  const referenceMonth = month ?? currentMonthString();
  const [yearStr, monthStr] = referenceMonth.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);

  const appointments = await appointmentRepository.findByProviderAndMonth(
    providerId,
    year,
    monthNum,
  );

  let scheduledCount = 0;
  let completedCount = 0;
  let canceledCount = 0;
  let noShowCount = 0;
  let scheduledRevenue = 0;
  let completedRevenue = 0;

  for (const apt of appointments) {
    const price = Number(apt.service.price);
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
  const nextAppointments = appointments
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
    totalAppointments: appointments.length,
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
