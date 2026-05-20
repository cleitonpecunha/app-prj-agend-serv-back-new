import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { ScheduleServices } from "../services/scheduleServices";
import { isSortableSchedule, sortSchedules } from "../../shared/libs";

export class ScheduleGetAllUseCase {
  constructor(private readonly schedulesRepository: ISchedulesRepository) {}

  async execute(auth: { userId: string }) {
    // Instanciar os serviços de horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Buscar todos os horários do usuário
    const existingSchedules =
      await scheduleServices.buscarTodosSchedulesPorUserId(auth.userId);

    // Filtrar apenas os horários que possuem as propriedades necessárias para ordenação
    const sortableSchedules = existingSchedules.filter(isSortableSchedule);

    // Ordenar os horários usando a função de ordenação
    const sortedSchedules = sortSchedules(sortableSchedules);

    // Retornar os horários ordenados
    return sortedSchedules;
  }
}
