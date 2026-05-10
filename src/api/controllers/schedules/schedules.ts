import { ConflictError, NotFoundError } from "@/lib/errors";
import { providerRepository } from "../providers/repository";
import { scheduleRepository } from "./repository";
import type { CreateScheduleInput, UpdateScheduleInput } from "./schemas";

const DAY_ORDER: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

function sortSchedules<T extends { dayOfWeek: string; startTime: string }>(
  schedules: T[],
): T[] {
  return [...schedules].sort((a, b) => {
    const dayDiff = DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek];
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function createSchedule(
  providerId: number,
  input: CreateScheduleInput,
) {
  const provider = await providerRepository.findById(providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const conflicts = await scheduleRepository.findConflicts({
    providerId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  if (conflicts.length > 0) {
    throw new ConflictError(
      "Já existe um horário cadastrado que conflita com o intervalo informado.",
    );
  }

  return scheduleRepository.create({ ...input, providerId });
}

export async function listSchedulesByProvider(providerId: number) {
  const provider = await providerRepository.findById(providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const schedules = await scheduleRepository.findByProviderId(providerId);
  return sortSchedules(schedules);
}

export async function updateSchedule(id: number, input: UpdateScheduleInput) {
  const existing = await scheduleRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Horário");
  }

  const conflicts = await scheduleRepository.findConflicts({
    providerId: existing.providerId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    ignoreId: id,
  });

  if (conflicts.length > 0) {
    throw new ConflictError(
      "Já existe um horário cadastrado que conflita com o intervalo informado.",
    );
  }

  return scheduleRepository.update(id, input);
}

export async function deleteSchedule(id: number) {
  const existing = await scheduleRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Horário");
  }

  await scheduleRepository.delete(id);
}
