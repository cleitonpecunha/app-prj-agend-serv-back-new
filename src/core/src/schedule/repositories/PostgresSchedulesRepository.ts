import {
  IScheduleFindConflictsParams,
  IScheduleResponseDTO,
  IScheduleUpdateRequestDTO,
} from "../dto/scheduleDTO";
import { ISchedulesRepository } from "./ISchedulesRepository";
import { prisma } from "@/lib/prisma";
import Schedule from "@/core/src/schedule/model/schedule";

export class PostgresSchedulesRepository implements ISchedulesRepository {
  async save(data: Schedule): Promise<void> {
    await prisma.schedule.create({
      data: data as Parameters<typeof prisma.schedule.create>[0]["data"],
    });
  }

  async findByManyUserId(userId: string): Promise<IScheduleResponseDTO[]> {
    const schedules = await prisma.schedule.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return schedules;
  }

  async findByIdUserId(
    id: string,
    userId: string,
  ): Promise<IScheduleResponseDTO> {
    const schedule = await prisma.schedule.findUnique({
      where: { id: id, userId: userId },
    });
    return schedule!;
  }

  /*
  async findConflicts({
    userId,
    dayOfWeek,
    startTime,
    endTime,
    ignoreId,
  }: IScheduleFindConflictsParams) {
    return prisma.schedule.findMany({
      where: {
        userId,
        dayOfWeek,
        ...(ignoreId !== undefined ? { id: { not: ignoreId } } : {}),
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });
  }
  */

  async findConflicts(
    data: IScheduleFindConflictsParams,
  ): Promise<IScheduleResponseDTO[]> {
    return prisma.schedule.findMany({
      where: {
        userId: data.userId,
        dayOfWeek: data.dayOfWeek,
        ...(data.ignoreId !== undefined ? { id: { not: data.ignoreId } } : {}),
        AND: [
          { startTime: { lt: data.endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: IScheduleUpdateRequestDTO,
  ): Promise<void> {
    const { ...payload } = data;

    await prisma.schedule.update({
      where: { id: id, userId: userId },
      data: payload as Parameters<typeof prisma.schedule.update>[0]["data"],
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.schedule.delete({ where: { id: id, userId: userId } });
  }
}
