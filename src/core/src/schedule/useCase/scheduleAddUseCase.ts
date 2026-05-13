import { ConflictError, NotFoundError } from "@/lib/errors";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { IScheduleAddRequestDTO } from "../dto/scheduleDTO";
import Schedule from "../model/schedule";
import { ISchedulesRepository } from "../repositories/ISchedulesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class ScheduleAddUseCase {
  constructor(
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly userRepository: IUsersRepository,
  ) {}

  async execute(
    auth: { userId: string },
    data: IScheduleAddRequestDTO,
  ): Promise<void> {
    // Verificar se o usuário/prestador logado existe e se há conflitos de horário
    const [existingUser, existingConflicts] = await Promise.all([
      this.userRepository.findById(auth.userId),
      this.schedulesRepository.findConflicts({
        userId: auth.userId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    ]);

    // Se o usuário/prestador logado não existir, lançar um erro
    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    if (existingConflicts.length > 0) {
      throw new ConflictError(MensagensPadronizadas.HORARIO_JA_CADASTRADO);
    }

    // Verificar se o usuário autenticado é o proprietário do serviço
    assertProviderOwnership(auth.userId, existingUser.id!);

    //console.log("Dados recebidos para criação do serviço:", data);

    // Criar a instância do hoario e salvar no repositório
    const schedule = new Schedule({
      ...data,
      userId: auth.userId,
    });

    // Salvar o horario no repositório
    await this.schedulesRepository.save(schedule);
  }
}
