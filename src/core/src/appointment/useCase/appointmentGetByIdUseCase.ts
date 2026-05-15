import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { NotFoundError } from "@/lib/errors";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class AppointmentGetByIdUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Verificar se existe o agendamento
    const [existingAppointment] = await Promise.all([
      this.appointmentsRepository.findById(id, auth.userId),
    ]);

    if (!existingAppointment) {
      throw new NotFoundError(MensagensPadronizadas.AGENDAMENTO_NAO_ENCONTRADO);
    }

    assertProviderOwnership(auth.userId, existingAppointment.userId!);

    return existingAppointment;
  }
}
