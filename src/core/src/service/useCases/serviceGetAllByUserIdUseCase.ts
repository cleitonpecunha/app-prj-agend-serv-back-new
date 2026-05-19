import { IServicesRepository } from "../repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { UserServices } from "../../user/services/userServices";
import { ServiceServices } from "../services/serviceServices";

export class ServiceGetAllByUserIdUseCase {
  constructor(
    private readonly servicesRepository: IServicesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    // instanciando o serviço de usuário para validar as regras de negócio
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador existe
    await userService.buscarUsuarioPorId(userId);

    /// instanciando o serviço de Services para validar as regras de negócio
    const serviceService = new ServiceServices(this.servicesRepository);

    // valida se o serviço existe e pertence ao usuário informado
    const existServices =
      await serviceService.buscarTodosServicosPorUserId(userId);

    // retorna os serviços encontrados
    return existServices;
  }
}
