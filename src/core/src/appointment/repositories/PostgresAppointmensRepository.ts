import Appointment from "../model/appointment";
import {
  IAppointmentResponseDTO,
  IAppointmentServiceResponseDTO,
  IAppointmentUpdateRequestDTO,
} from "../dto/appointmentDTO";
import { prisma } from "@/lib/prisma";
import { IAppointmentsRepository } from "./IAppointmentsRepository";

export class PostgresAppointmentsRepository implements IAppointmentsRepository {
  async save(data: Appointment): Promise<void> {
    await prisma.appointment.create({
      data: data as Parameters<typeof prisma.appointment.create>[0]["data"],
    });
  }

  async updateStatus(
    id: string,
    data: IAppointmentUpdateRequestDTO,
  ): Promise<void> {
    await prisma.appointment.update({ where: { id }, data });
  }

  async delete(id: string, userId: string, serviceId: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id: id, userId: userId, serviceId: serviceId },
    });
  }

  async findByManyUserId(userId: string): Promise<IAppointmentResponseDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { userId: userId },
      orderBy: { appointmentDate: "desc" },
    });
    return appointments;
  }

  async findById(
    id: string,
    userId: string,
    serviceId: string,
  ): Promise<IAppointmentResponseDTO> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id, userId: userId, serviceId: serviceId },
    });
    return appointment!;
  }

  async findManyByUserIdAndDate(
    userId: string,
    appointmentDate: Date,
  ): Promise<IAppointmentServiceResponseDTO[]> {
    return prisma.appointment.findMany({
      where: { userId, appointmentDate },
      include: {
        service: {
          select: { name: true, durationMinutes: true, priceInCents: true },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  async findManyByUserIdAndMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<IAppointmentServiceResponseDTO[]> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    return prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: { gte: startDate, lt: endDate },
      },
      include: {
        service: {
          select: { name: true, durationMinutes: true, priceInCents: true },
        },
      },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  }
}
