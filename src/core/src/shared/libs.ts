import { IAppointmentServiceResponseDTO } from "../appointment/dto/appointmentDTO";
import { IScheduleResponseDTO } from "../schedule/dto/scheduleDTO";
import { dayofweek } from "./dayofweek";

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function currentMonthString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getBucketKey(dateStr: string, groupBy: string): string {
  if (groupBy === "week") {
    const day = new Date(`${dateStr}T00:00:00.000Z`).getUTCDate();
    return `week-${Math.ceil(day / 7)}`;
  }
  if (groupBy === "month") {
    return dateStr.slice(0, 7);
  }
  return dateStr;
}

export function getBucketLabel(key: string, groupBy: string): string {
  if (groupBy === "week") {
    const weekNum = key.split("-")[1];
    return `Semana ${weekNum}`;
  }
  return key;
}

export function toAppointmentDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function getDayOfWeek(date: Date) {
  return dayofweek[date.getUTCDay()];
}

export function parseTimeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateDate(data: string, hora: string): boolean {
  const appointmentDateTime = toAppointmentDate(data);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return false;
  }

  const [hours, minutes] = hora.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  appointmentDateTime.setUTCHours(hours!, minutes, 0, 0);
  return appointmentDateTime.getTime() < Date.now();
}

export function intervalFitsSchedule(
  schedules: IScheduleResponseDTO[],
  appointmentDayOfWeek: string,
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return schedules.some((schedules) => {
    if (schedules.dayOfWeek !== appointmentDayOfWeek) {
      return false;
    }

    const scheduleStartMinutes = parseTimeToMinutes(schedules.startTime);
    const scheduleEndMinutes = parseTimeToMinutes(schedules.endTime);

    return (
      scheduleStartMinutes <= requestedStartMinutes &&
      scheduleEndMinutes >= requestedEndMinutes
    );
  });
}

export function hasAppointmentConflict(
  existingAppointments: IAppointmentServiceResponseDTO[],
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return existingAppointments.some((appointment) => {
    const existingStartMinutes = parseTimeToMinutes(appointment.startTime);
    const existingEndMinutes =
      existingStartMinutes + appointment.service.durationMinutes;

    return (
      existingStartMinutes < requestedEndMinutes &&
      existingEndMinutes > requestedStartMinutes
    );
  });
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
