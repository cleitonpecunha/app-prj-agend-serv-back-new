import { NotFoundError } from "@/lib/errors";
import { IServiceAddRequestDTO } from "../dto/serviceDTO";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import Service from "../model/service";
import { assertProviderOwnership } from "@/lib/auth";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceAddUseCase {
  constructor(
    private readonly servicesRepository: IServicesRepository,
    private readonly userRepository: IUsersRepository,
  ) {}

  async execute(
    auth: { userId: string },
    data: IServiceAddRequestDTO,
  ): Promise<void> {
    // Verificar se o usuário/prestador existe
    const [existingUser] = await Promise.all([
      this.userRepository.findById(data.userId),
    ]);

    // Se o usuário/prestador não existir, lançar um erro
    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    // Verificar se o usuário autenticado é o proprietário do serviço
    assertProviderOwnership(auth.userId, existingUser.id!);

    //console.log("Dados recebidos para criação do serviço:", data);

    // Criar a instância do serviço e salvar no repositório
    const service = new Service(data);

    // Salvar o serviço no repositório
    await this.servicesRepository.save(service);
  }
}
