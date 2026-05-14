import { NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceGetByIdUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    //console.log("id:", id);
    //console.log("auth:", auth.userId);

    // validar se o serviço existe e pertence ao usuário autenticado
    const [existingService] = await Promise.all([
      this.servicesRepository.findByIdUserId(id, auth.userId),
    ]);

    if (!existingService) {
      throw new NotFoundError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    assertProviderOwnership(auth.userId, existingService.userId!);

    return existingService;
  }
}
