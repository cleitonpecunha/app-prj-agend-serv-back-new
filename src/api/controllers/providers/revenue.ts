import { AppointmentStatus } from "@/generated/prisma/enums";
import { NotFoundError } from "@/lib/errors";
import { appointmentRepository } from "../appointments/repository";
import { providerRepository } from "./repository";
import type { RevenueQuery } from "./schemas";

interface RevenueBucket {
  label: string;
  startDate: string;
  endDate: string;
  scheduledRevenue: number;
  completedRevenue: number;
  appointmentCount: number;
}

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

export async function getProviderRevenue(
  providerId: number,
  query: RevenueQuery,
) {
  const provider = await providerRepository.findById(providerId);
  if (!provider) throw new NotFoundError("Prestador");

  const [yearStr, monthStr] = query.month.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const appointments = await appointmentRepository.findByProviderAndMonth(
    providerId,
    year,
    month,
  );

  const bucketsMap = new Map<string, RevenueBucket>();

  for (const apt of appointments) {
    if (
      apt.status !== AppointmentStatus.scheduled &&
      apt.status !== AppointmentStatus.completed
    ) {
      continue;
    }

    const dateStr = toDateString(apt.appointmentDate);
    const key = getBucketKey(dateStr, query.groupBy);
    const price = Number(apt.service.price);
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
