import Appointment from "../model/appointment";
import {
  IAppointmentResponseDTO,
  IAppointmentServiceResponseDTO,
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

  findManyByUserIdAndDate(
    userId: string,
    appointmentDate: Date,
  ): Promise<IAppointmentServiceResponseDTO[]>;

  findManyByUserIdAndMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<IAppointmentServiceResponseDTO[]>;
}
