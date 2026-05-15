import { AppointmentStatus } from "@/generated/prisma/enums";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";
import { IAppointmentUpdateRequestDTO } from "../dto/appointmentDTO";

export class AppointmentUpdateStatusUseCase {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IAppointmentUpdateRequestDTO,
  ) {
    // Verificar se existe o agendamento
    const [existingAppointment] = await Promise.all([
      this.appointmentsRepository.findById(id, auth.userId),
    ]);

    if (!existingAppointment) {
      throw new NotFoundError(MensagensPadronizadas.AGENDAMENTO_NAO_ENCONTRADO);
    }

    assertProviderOwnership(auth.userId, existingAppointment.userId!);

    if (existingAppointment.status !== AppointmentStatus.scheduled) {
      throw new ConflictError(
        MensagensPadronizadas.AGENDAMENTO_STATUS_INVALIDO,
      );
    }

    if (data.status === AppointmentStatus.scheduled) {
      throw new AppError(
        MensagensPadronizadas.AGENDAMENTO_STATUS_INVALIDO_PARA_ATUALIZACAO,
        422,
      );
    }

    await this.appointmentsRepository.updateStatus(id, auth.userId, data);
  }
}
