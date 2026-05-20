import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import {
  IScheduleFindConflictsParams,
  IScheduleUpdateRequestDTO,
} from "../dto/scheduleDTO";
import { ScheduleServices } from "../services/scheduleServices";

export class ScheduleUpdateUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IScheduleUpdateRequestDTO,
  ) {
    // Instanciar os serviços de horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Validar se o horário existe e pertence ao usuário
    await scheduleServices.buscarHorarioPorIdUserId(id, auth.userId);

    // atribuir os dados para o método de verificação de conflitos
    let scheduleParams = {
      ...data,
      userId: auth.userId,
      ignoreId: id,
    } as IScheduleFindConflictsParams;

    // Verificar se há conflitos de horário
    await scheduleServices.verificarConflitosDeHorario(scheduleParams);

    // Atualizar o horário
    await this.schedulesRepository.update(id, auth.userId, data);
  }
}
