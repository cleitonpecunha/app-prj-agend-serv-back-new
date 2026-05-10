import { prisma } from "@/lib/prisma";

interface ScheduleCreateData {
  providerId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ScheduleUpdateData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface FindConflictsParams {
  providerId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  ignoreId?: number;
}

export const scheduleRepository = {
  async create(data: ScheduleCreateData) {
    return prisma.schedule.create({ data });
  },

  async findById(id: number) {
    return prisma.schedule.findUnique({ where: { id } });
  },

  async findByProviderId(providerId: number) {
    return prisma.schedule.findMany({
      where: { providerId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  async findConflicts({
    providerId,
    dayOfWeek,
    startTime,
    endTime,
    ignoreId,
  }: FindConflictsParams) {
    return prisma.schedule.findMany({
      where: {
        providerId,
        dayOfWeek,
        ...(ignoreId !== undefined ? { id: { not: ignoreId } } : {}),
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });
  },

  async update(id: number, data: ScheduleUpdateData) {
    return prisma.schedule.update({ where: { id }, data });
  },

  async delete(id: number) {
    await prisma.schedule.delete({ where: { id } });
  },
};
