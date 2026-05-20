import { ConflictError } from "@/lib/errors";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class ServiceServices {
  constructor(private readonly servicesRepository: IServicesRepository) {}

  // Método para buscar um servico por ID e UserID
  async buscarServicoPorIdUserId(id: string, userId: string) {
    const existService = await this.servicesRepository.findByIdUserId(
      id,
      userId,
    );

    if (!existService) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_NAO_ENCONTRADO);
    }

    return existService;
  }

  // Método para buscar um servico por ID
  async buscarServicoPorId(id: string) {
    const existService = await this.servicesRepository.findById(id);

    if (!existService) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_NAO_ENCONTRADO);
    }

    if (!existService.isActive) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_INATIVO);
    }

    return existService;
  }

  // Método para validar se um serviço tem agendamento
  async buscarServicosComAgendamento(id: string) {
    const hasAppointments = await this.servicesRepository.hasAppointments(id);

    if (hasAppointments) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_COM_AGENDAMENTOS);
    }
  }

  // Método para buscar todos os serviços de um usuário
  async buscarTodosServicosPorUserId(userId: string) {
    const existServices =
      await this.servicesRepository.findByManyUserId(userId);

    if (!existServices || existServices.length === 0) {
      throw new ConflictError(MensagensPadronizadas.SERVICOS_NAO_ENCONTRADOS);
    }

    return existServices;
  }
}
