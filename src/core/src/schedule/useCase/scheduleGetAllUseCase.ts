import { NotFoundError } from "@/lib/errors";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { DayOrder } from "../../shared/dayorder";

function sortSchedules<T extends { dayOfWeek: string; startTime: string }>(
  schedules: T[],
): T[] {
  return [...schedules].sort((a, b) => {
    const dayDiff = DayOrder[a.dayOfWeek]! - DayOrder[b.dayOfWeek]!;
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

function isSortableSchedule(s: {
  dayOfWeek?: string;
  startTime?: string;
}): s is { dayOfWeek: string; startTime: string } {
  return typeof s.dayOfWeek === "string" && typeof s.startTime === "string";
}

export class ScheduleGetAllUseCase {
  constructor(
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(auth: { userId: string }) {
    const [existingUser, existingSchedules] = await Promise.all([
      this.usersRepository.findById(auth.userId),
      this.schedulesRepository.findByManyUserId(auth.userId),
    ]);

    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    if (!existingSchedules || existingSchedules.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.HORARIOS_NAO_ENCONTRADOS);
    }

    const sortableSchedules = existingSchedules.filter(isSortableSchedule);
    const sortedSchedules = sortSchedules(sortableSchedules);

    return sortedSchedules;
  }
}
