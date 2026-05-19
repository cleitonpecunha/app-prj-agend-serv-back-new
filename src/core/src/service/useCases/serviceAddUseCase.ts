import { IServiceAddRequestDTO } from "../dto/serviceDTO";
import { IServicesRepository } from "../repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import Service from "../model/service";
import { UserServices } from "../../user/services/userServices";

export class ServiceAddUseCase {
  constructor(
    private readonly servicesRepository: IServicesRepository,
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(
    auth: { userId: string },
    data: IServiceAddRequestDTO,
  ): Promise<void> {
    // instanciando o serviço de usuário para validar as regras de negócio
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador logado existe
    await userService.buscarUsuarioPorId(auth.userId);

    // Criar a instância do serviço e salvar no repositório
    const service = new Service({
      ...data,
      userId: auth.userId,
    });

    // Salvar o serviço no repositório
    await this.servicesRepository.save(service);
  }
}
