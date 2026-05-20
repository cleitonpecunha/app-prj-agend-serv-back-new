import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { AppointmentServices } from "../services/appointmentServices";

export class AppointmentGetByIdUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Criar uma instância dos serviços de agendamento
    const appointmentServices = new AppointmentServices(
      this.appointmentsRepository,
    );

    // Buscar o agendamento pelo ID e UserID usando os serviços de agendamento
    const existingAppointment =
      await appointmentServices.buscarAgendamentoPorIdUserId(id, auth.userId);

    // retornar o agendamento encontrado
    return existingAppointment;
  }
}
