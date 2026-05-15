import Appointment from "../model/appointment";
import {
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
    userId: string,
    data: IAppointmentUpdateRequestDTO,
  ): Promise<void> {
    await prisma.appointment.update({
      where: { id: id, userId: userId },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id: id, userId: userId },
    });
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<IAppointmentServiceResponseDTO> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id, userId: userId },
      include: {
        user: { select: { name: true } },
        service: {
          select: { name: true, durationMinutes: true, priceInCents: true },
        },
      },
    });
    return appointment!;
  }

  async findByManyUserId(
    userId: string,
  ): Promise<IAppointmentServiceResponseDTO[]> {
    const appointments = await prisma.appointment.findMany({
      where: { userId: userId },
      include: {
        user: { select: { name: true } },
        service: {
          select: { name: true, durationMinutes: true, priceInCents: true },
        },
      },
      orderBy: { appointmentDate: "desc" },
    });
    return appointments;
  }

  async findManyByUserIdAndDate(
    userId: string,
    appointmentDate: Date,
  ): Promise<IAppointmentServiceResponseDTO[]> {
    return prisma.appointment.findMany({
      where: { userId, appointmentDate },
      include: {
        user: { select: { name: true } },
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
        user: { select: { name: true } },
        service: {
          select: { name: true, durationMinutes: true, priceInCents: true },
        },
      },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });
  }
}
