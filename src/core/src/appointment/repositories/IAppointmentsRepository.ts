import Appointment from "../model/appointment";
import {
  IAppointmentResponseDTO,
  IAppointmentUpdateRequestDTO,
} from "../dto/appointmentDTO";
import Schedule from "@/core/src/schedule/model/schedule";

export interface IAppointmentsRepository {
  save(data: Appointment): Promise<void>;

  updateStatus(id: string, data: IAppointmentUpdateRequestDTO): Promise<void>;

  delete(id: string, userId: string, serviceId: string): Promise<void>;

  findByManyUserId(userId: string): Promise<IAppointmentResponseDTO[]>;

  findById(
    id: string,
    userId: string,
    serviceId: string,
  ): Promise<IAppointmentResponseDTO>;

  findManyByUserAndDate(
    userId: string,
    appointmentDate: Date,
  ): Promise<IAppointmentResponseDTO[]>;

  findManyByUserAndMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<IAppointmentResponseDTO[]>;
}
