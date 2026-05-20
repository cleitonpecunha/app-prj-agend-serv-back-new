import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { NotFoundError } from "@/lib/errors";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";
import { AppointmentServices } from "../services/appointmentServices";

export class AppointmentDeleteUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Criar uma instância dos serviços de agendamento
    const appointmentServices = new AppointmentServices(
      this.appointmentsRepository,
    );

    // Buscar o agendamento pelo ID e UserID usando os serviços de agendamento
    await appointmentServices.buscarAgendamentoPorIdUserId(id, auth.userId);

    // Remover o agendamento usando o repositório
    await this.appointmentsRepository.delete(id, auth.userId);
  }
}
