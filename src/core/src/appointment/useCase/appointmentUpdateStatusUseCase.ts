import { AppointmentServices } from "../services/appointmentServices";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { IAppointmentUpdateRequestDTO } from "../dto/appointmentDTO";

export class AppointmentUpdateStatusUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IAppointmentUpdateRequestDTO,
  ) {
    // Criar uma instância dos serviços de agendamento
    const appointmentServices = new AppointmentServices(
      this.appointmentsRepository,
    );

    // Buscar o agendamento pelo ID e UserID usando os serviços de agendamento
    const existingAppointment =
      await appointmentServices.buscarAgendamentoPorIdUserId(id, auth.userId);

    // validar se o status atual do agendamento for diferente de "scheduled" que pode ser alterado
    await appointmentServices.validarPermiteAtualizarStatus(
      existingAppointment.status,
    );

    // validar se o novo status é "scheduled", o que não é permitido
    await appointmentServices.validarNovoStatusParaAtualizacao(data.status);

    // Atualizar o status do agendamento usando o repositório
    await this.appointmentsRepository.updateStatus(id, auth.userId, data);
  }
}
