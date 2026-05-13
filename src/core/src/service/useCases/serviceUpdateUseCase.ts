import { NotFoundError } from "@/lib/errors";
import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { assertProviderOwnership } from "@/lib/auth";

export class ServiceUpdateUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IServiceUpdateRequestDTO,
  ) {
    //console.log("Auth userId:", auth.userId);

    // validar se o serviço existe e pertence ao usuário autenticado
    const [existingService] = await Promise.all([
      this.servicesRepository.findById(id, auth.userId),
    ]);

    if (!existingService) {
      throw new NotFoundError(MensagensPadronizadas.SERVICO_NAO_ENCONTRADO);
    }

    assertProviderOwnership(auth.userId, existingService.userId!);

    await this.servicesRepository.update(id, auth.userId, data);
  }
}
