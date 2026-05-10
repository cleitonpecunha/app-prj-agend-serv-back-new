import { prisma } from "@/lib/prisma";

interface ServiceCreateData {
  providerId: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

interface ServiceUpdateData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export const serviceRepository = {
  async create(data: ServiceCreateData) {
    return prisma.service.create({ data });
  },

  async findById(id: number) {
    return prisma.service.findUnique({ where: { id } });
  },

  async findMany() {
    return prisma.service.findMany({ orderBy: { id: "asc" } });
  },

  async findByProviderId(providerId: number) {
    return prisma.service.findMany({
      where: { providerId },
      orderBy: { id: "asc" },
    });
  },

  async update(id: number, data: ServiceUpdateData) {
    return prisma.service.update({ where: { id }, data });
  },

  async delete(id: number) {
    await prisma.service.delete({ where: { id } });
  },

  async hasAppointments(id: number) {
    const count = await prisma.appointment.count({ where: { serviceId: id } });
    return count > 0;
  },
};
