import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUserRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceGetByUserIdUseCase {
  constructor(
    private readonly servicesRepository: IServicesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    const services = await this.servicesRepository.findByManyUserId(userId);

    if (!services || services.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    return services;
  }
}
