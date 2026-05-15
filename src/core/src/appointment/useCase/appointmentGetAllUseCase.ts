import { NotFoundError } from "@/lib/errors";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class AppointmentGetAllUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(auth: { userId: string }) {
    // Buscar os agendamentos do usuário autenticado
    const [existingAppointments] = await Promise.all([
      this.appointmentsRepository.findByManyUserId(auth.userId),
    ]);

    if (!existingAppointments || existingAppointments.length === 0) {
      throw new NotFoundError(
        MensagensPadronizadas.AGENDAMENTOS_NAO_ENCONTRADOS,
      );
    }

    assertProviderOwnership(auth.userId, existingAppointments[0]!.userId!);

    return existingAppointments;
  }
}
