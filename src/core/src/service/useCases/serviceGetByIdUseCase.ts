import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceGetByIdUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    //console.log("id:", id);
    //console.log("auth:", auth.userId);

    const service = await this.servicesRepository.findById(id, auth.userId);

    if (!service) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    assertProviderOwnership(auth.userId, service.userId!);

    return service;
  }
}
