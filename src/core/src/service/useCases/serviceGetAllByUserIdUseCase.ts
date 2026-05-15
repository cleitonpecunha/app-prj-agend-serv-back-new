import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceGetAllByUserIdUseCase {
  constructor(
    private readonly servicesRepository: IServicesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    const [existingUser, existingServices] = await Promise.all([
      this.usersRepository.findById(userId),
      this.servicesRepository.findByManyUserId(userId),
    ]);

    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    if (!existingServices || existingServices.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    return existingServices;
  }
}
