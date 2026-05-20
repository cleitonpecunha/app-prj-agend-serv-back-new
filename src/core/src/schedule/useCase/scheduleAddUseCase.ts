import {
  IScheduleAddRequestDTO,
  IScheduleFindConflictsParams,
} from "../dto/scheduleDTO";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { ScheduleServices } from "../services/scheduleServices";
import { UserServices } from "../../user/services/userServices";
import Schedule from "../model/schedule";

export class ScheduleAddUseCase {
  constructor(
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(
    auth: { userId: string },
    data: IScheduleAddRequestDTO,
  ): Promise<void> {
    // Instanciar os serviços do usuário
    const userServices = new UserServices(this.usersRepository);

    // Verificar se o usuário existe
    await userServices.buscarUsuarioPorId(auth.userId);

    // Instanciar os serviços de horário
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // atribuir os dados para o método de verificação de conflitos
    let scheduleParams = {
      ...data,
      userId: auth.userId,
    } as IScheduleFindConflictsParams;

    // Verificar se há conflitos de horário
    await scheduleServices.verificarConflitosDeHorario(scheduleParams);

    // Criar a instância do hoario e salvar no repositório
    const schedule = new Schedule({
      ...data,
      userId: auth.userId,
    });

    // Salvar o horario no repositório
    await this.schedulesRepository.save(schedule);
  }
}
