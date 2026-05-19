import { IServicesRepository } from "../repositories/IServicesRepository";
import { ServiceServices } from "../services/serviceServices";

export class ServiceGetByIdUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(id: string, auth: { userId: string }) {
    // instanciando o serviço de Services para validar as regras de negócio
    const serviceService = new ServiceServices(this.servicesRepository);

    // valida se o serviço existe e pertence ao usuário autenticado
    const existService = await serviceService.buscarServicoPorIdUserId(
      id,
      auth.userId,
    );

    return existService;
  }
}
