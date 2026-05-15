import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceGetAllUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(auth: { userId: string }) {
    // Buscar os serviços do usuário autenticado
    const [existingServices] = await Promise.all([
      this.servicesRepository.findByManyUserId(auth.userId),
    ]);

    if (!existingServices || existingServices.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    return existingServices;
  }
}
