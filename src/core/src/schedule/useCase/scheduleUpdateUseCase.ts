import { ConflictError, NotFoundError } from "@/lib/errors";
import { IScheduleUpdateRequestDTO } from "../dto/scheduleDTO";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class ScheduleUpdateUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IScheduleUpdateRequestDTO,
  ) {
    //console.log("Auth userId:", auth.userId);

    // Verificar se existe o horário e se há conflitos de horário
    const [existingSchedule, existingConflicts] = await Promise.all([
      this.schedulesRepository.findById(id, auth.userId),
      this.schedulesRepository.findConflicts({
        userId: auth.userId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    ]);

    if (!existingSchedule) {
      throw new NotFoundError(MensagensPadronizadas.HORARIO_NAO_ENCONTRADO);
    }

    if (existingConflicts.length > 0) {
      throw new ConflictError(MensagensPadronizadas.HORARIO_JA_CADASTRADO);
    }

    assertProviderOwnership(auth.userId, existingSchedule.userId!);

    await this.schedulesRepository.update(id, auth.userId, data);
  }
}
