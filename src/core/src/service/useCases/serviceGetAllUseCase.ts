import { IServicesRepository } from "../repositories/IServicesRepository";
import { ServiceServices } from "../services/serviceServices";

export class ServiceGetAllUseCase {
  constructor(private servicesRepository: IServicesRepository) {}

  async execute(auth: { userId: string }) {
    /// instanciando o serviço de Services para validar as regras de negócio
    const serviceService = new ServiceServices(this.servicesRepository);

    // valida se o serviço existe e pertence ao usuário autenticado
    const existServices = await serviceService.buscarTodosServicosPorUserId(
      auth.userId,
    );

    // retorna os serviços encontrados
    return existServices;
  }
}
