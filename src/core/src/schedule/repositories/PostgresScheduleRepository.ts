import Schedule from "@/core/src/schedule/model/schedule";
import { prisma } from "@/lib/prisma";
import { IScheduleUpdateRequestDTO } from "../dto/scheduleDTO";
import { IScheduleRepository } from "./IScheduleRepository";

export class PostgresScheduleRepository implements IScheduleRepository {
  async save(data: Schedule): Promise<void> {
    await prisma.schedule.create({
      data: data as Parameters<typeof prisma.schedule.create>[0]["data"],
    });
  }

  async findByManyUserId(userId: string): Promise<Schedule[]> {
    const schedules = await prisma.schedule.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return schedules;
  }

  async findById(id: string, userId: string): Promise<Schedule> {
    const schedule = await prisma.schedule.findUnique({
      where: { id: id, userId: userId },
    });
    return schedule!;
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
