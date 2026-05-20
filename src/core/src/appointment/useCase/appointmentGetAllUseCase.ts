import { AppointmentServices } from "../services/appointmentServices";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";

export class AppointmentGetAllUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(auth: { userId: string }) {
    // Criar uma instância dos serviços de agendamento
    const appointmentServices = new AppointmentServices(
      this.appointmentsRepository,
    );

    // Buscar os agendamentos do usuário autenticado usando os serviços de agendamento
    const existingAppointments =
      await appointmentServices.buscarTodosAgendamentosPorUserId(auth.userId);

    // retornar os agendamentos encontrados
    return existingAppointments;
  }
}
