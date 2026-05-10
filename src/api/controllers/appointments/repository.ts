import { prisma } from "@/lib/prisma";

interface AppointmentCreateData {
  providerId: number;
  serviceId: number;
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

interface AppointmentStatusUpdateData {
  status: "completed" | "canceled" | "no_show";
}

export const appointmentRepository = {
  async create(data: AppointmentCreateData) {
    return prisma.appointment.create({ data });
  },

  async findById(id: number) {
    return prisma.appointment.findUnique({ where: { id } });
  },

  async findByProviderId(providerId: number) {
    return prisma.appointment.findMany({
      where: { providerId },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  },

  async findByProviderAndDate(providerId: number, appointmentDate: Date) {
    return prisma.appointment.findMany({
      where: { providerId, appointmentDate },
      include: {
        service: {
          select: {
            durationMinutes: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  },

  async updateStatus(id: number, data: AppointmentStatusUpdateData) {
    return prisma.appointment.update({ where: { id }, data });
  },

  async findByProviderAndMonth(
    providerId: number,
    year: number,
    month: number,
  ) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    return prisma.appointment.findMany({
      where: {
        providerId,
        appointmentDate: { gte: startDate, lt: endDate },
      },
      include: {
        service: {
          select: { name: true, price: true },
        },
      },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  },
};
