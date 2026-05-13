import { NotFoundError } from "@/lib/errors";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class ScheduleDeleteUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Verificar se existe o horário
    const [existingSchedule] = await Promise.all([
      this.schedulesRepository.findById(id, auth.userId),
    ]);

    if (!existingSchedule) {
      throw new NotFoundError(MensagensPadronizadas.HORARIO_NAO_ENCONTRADO);
    }

    assertProviderOwnership(auth.userId, existingSchedule.userId!);

    await this.schedulesRepository.delete(id, auth.userId);
  }
}
