import { ConflictError, NotFoundError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceDeleteUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // validar se o serviço existe e pertence ao usuário autenticado
    const [existingService] = await Promise.all([
      this.servicesRepository.findByIdUserId(id, auth.userId),
    ]);

    if (!existingService) {
      throw new NotFoundError(MensagensPadronizadas.SERVICO_NAO_ENCONTRADO);
    }

    const hasAppointments = await this.servicesRepository.hasAppointments(id);
    if (hasAppointments) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_COM_AGENDAMENTOS);
    }

    assertProviderOwnership(auth.userId, existingService.userId!);

    await this.servicesRepository.delete(id, auth.userId);
  }
}
