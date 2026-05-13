import { NotFoundError } from "@/lib/errors";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

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
    const dayDiff = DAY_ORDER[a.dayOfWeek]! - DAY_ORDER[b.dayOfWeek]!;
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

export class ScheduleGetByUserIdUseCase {
  constructor(
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    const [existingUser, existingSchedules] = await Promise.all([
      this.usersRepository.findById(userId),
      this.schedulesRepository.findByManyUserId(userId),
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
