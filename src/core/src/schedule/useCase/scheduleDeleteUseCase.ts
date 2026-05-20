import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { ScheduleServices } from "../services/scheduleServices";

export class ScheduleDeleteUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Instanciar os serviços de horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Validar se o horário existe e pertence ao usuário
    await scheduleServices.buscarHorarioPorIdUserId(id, auth.userId);

    await this.schedulesRepository.delete(id, auth.userId);
  }
}
