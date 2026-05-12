import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceListUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(auth: { userId: string }) {
    const services = await this.servicesRepository.findByManyUserId(
      auth.userId,
    );

    if (!services || services.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    return services;
  }
}
