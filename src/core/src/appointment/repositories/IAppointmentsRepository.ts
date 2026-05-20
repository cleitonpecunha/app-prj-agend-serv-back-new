import Appointment from "../model/appointment";
import {
  IAppointmentServiceResponseDTO,
  IAppointmentUpdateRequestDTO,
} from "../dto/appointmentDTO";
import Schedule from "@/core/src/schedule/model/schedule";

export interface IAppointmentsRepository {
  save(data: Appointment): Promise<void>;

  updateStatus(
    id: string,
    userId: string,
    data: IAppointmentUpdateRequestDTO,
  ): Promise<void>;

  delete(id: string, userId: string): Promise<void>;

  findByIdUserId(
    id: string,
    userId: string,
  ): Promise<IAppointmentServiceResponseDTO>;

  findByManyUserId(userId: string): Promise<IAppointmentServiceResponseDTO[]>;

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
