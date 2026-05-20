import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { ScheduleServices } from "../services/scheduleServices";
import { UserServices } from "../../user/services/userServices";
import { isSortableSchedule, sortSchedules } from "../../shared/libs";

export class ScheduleGetAllByUserIdUseCase {
  constructor(
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    // Instanciar os serviços do usuário
    const userServices = new UserServices(this.usersRepository);

    // Verificar se o usuário existe
    await userServices.buscarUsuarioPorId(userId);

    // Instanciar os serviços de horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Buscar todos os horários do usuário
    const existingSchedules =
      await scheduleServices.buscarTodosSchedulesPorUserId(userId);

    // Filtrar apenas os horários que possuem as propriedades necessárias para ordenação
    const sortableSchedules = existingSchedules.filter(isSortableSchedule);

    // Ordenar os horários usando a função de ordenação
    const sortedSchedules = sortSchedules(sortableSchedules);

    // Retornar os horários ordenados
    return sortedSchedules;
  }
}
