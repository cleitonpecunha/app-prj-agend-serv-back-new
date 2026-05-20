import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { ScheduleServices } from "../services/scheduleServices";

export class ScheduleGetByIdUseCase {
  constructor(private schedulesRepository: ISchedulesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // Instanciando o serviço para verificar a propriedade do horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Verificando se o horário existe e pertence ao usuário autenticado
    const existingSchedule = await scheduleServices.buscarHorarioPorIdUserId(
      id,
      auth.userId,
    );

    // Se o horário não existir ou não pertencer ao usuário, lançar um erro
    return existingSchedule;
  }
}
