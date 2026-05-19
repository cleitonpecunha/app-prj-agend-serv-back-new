import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { ServiceServices } from "../services/serviceServices";

export class ServiceUpdateUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IServiceUpdateRequestDTO,
  ) {
    // instanciando o serviço de Services para validar as regras de negócio
    const serviceService = new ServiceServices(this.servicesRepository);

    // valida se o serviço existe e pertence ao usuário autenticado
    await serviceService.buscarServicoPorIdUserId(id, auth.userId);

    // atualiza o serviço no repositório
    await this.servicesRepository.update(id, auth.userId, data);
  }
}
