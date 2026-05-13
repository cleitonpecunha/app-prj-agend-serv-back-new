import { NotFoundError } from "@/lib/errors";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class ScheduleGetByIdUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    //console.log("id:", id);
    //console.log("auth:", auth.userId);

    // validar se o horário existe e pertence ao usuário autenticado
    const [existingSchedule] = await Promise.all([
      this.schedulesRepository.findById(id, auth.userId),
    ]);

    if (!existingSchedule) {
      throw new NotFoundError(MensagensPadronizadas.HORARIO_NAO_ENCONTRADO);
    }

    assertProviderOwnership(auth.userId, existingSchedule.userId!);

    return existingSchedule;
  }
}
