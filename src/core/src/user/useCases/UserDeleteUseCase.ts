import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { UserServices } from "../services/userServices";

export class UserDeleteUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(auth: { userId: string }) {
    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador logado existe, antes de excluir
    await userService.buscarUsuarioPorId(auth.userId);

    await this.usersRepository.delete(auth.userId);
  }
}
