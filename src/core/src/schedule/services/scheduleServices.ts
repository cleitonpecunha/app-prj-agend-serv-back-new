import { ConflictError, NotFoundError } from "@/lib/errors";
import { IScheduleFindConflictsParams } from "../dto/scheduleDTO";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ScheduleServices {
  constructor(private readonly schedulesRepository: ISchedulesRepository) {}

  // Método para verificar conflitos de horário
  async verificarConflitosDeHorario(data: IScheduleFindConflictsParams) {
    const existConflicts = await this.schedulesRepository.findConflicts(data);

    if (existConflicts.length > 0) {
      throw new ConflictError(MensagensPadronizadas.HORARIO_JA_CADASTRADO);
    }
  }

  // Método para buscar um schedule por ID e UserID
  async buscarHorarioPorIdUserId(id: string, userId: string) {
    const existSchedule = await this.schedulesRepository.findByIdUserId(
      id,
      userId,
    );

    if (!existSchedule) {
      throw new NotFoundError(MensagensPadronizadas.HORARIO_NAO_ENCONTRADO);
    }

    return existSchedule;
  }

  // Método para buscar todos os schedules de um usuário
  async buscarTodosSchedulesPorUserId(userId: string) {
    const existSchedules =
      await this.schedulesRepository.findByManyUserId(userId);

    if (!existSchedules || existSchedules.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.HORARIOS_NAO_ENCONTRADOS);
    }

    return existSchedules;
  }
}
