import { IServicesRepository } from "../repositories/IServicesRepository";
import { ServiceServices } from "../services/serviceServices";

export class ServiceDeleteUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // instanciando o serviço de Services para validar as regras de negócio
    const serviceService = new ServiceServices(this.servicesRepository);

    // valida se o serviço existe e pertence ao usuário autenticado
    await serviceService.buscarServicoPorIdUserId(id, auth.userId);

    // valida se o serviço tem agendamento, se tiver, não pode ser excluído
    await serviceService.buscarServicosComAgendamento(id);

    // excluir o serviço do repositório
    await this.servicesRepository.delete(id, auth.userId);
  }
}
