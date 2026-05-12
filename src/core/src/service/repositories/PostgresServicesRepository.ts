import Service from "@/core/src/service/model/service";
import { IServicesRepository } from "./IServicesRepository";
import { prisma } from "@/lib/prisma";
import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";

export class PostgresServicesRepository implements IServicesRepository {
  async save(data: Service): Promise<void> {
    await prisma.service.create({
      data: data as Parameters<typeof prisma.service.create>[0]["data"],
    });
  }

  async findByManyUserId(userId: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" },
    });
    return services;
  }

  async findById(id: string, userId: string): Promise<Service> {
    const service = await prisma.service.findUnique({
      where: { id: id, userId: userId },
    });
    return service!;
  }

  async update(
    id: string,
    userId: string,
    data: IServiceUpdateRequestDTO,
  ): Promise<void> {
    const { ...payload } = data;

    await prisma.service.update({
      where: { id: id, userId: userId },
      data: payload as Parameters<typeof prisma.service.update>[0]["data"],
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.service.delete({ where: { id: id, userId: userId } });
  }

  async hasAppointments(idService: string) {
    const count = await prisma.appointment.count({
      where: { serviceId: idService },
    });
    return count > 0;
  }
}
