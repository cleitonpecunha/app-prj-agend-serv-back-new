import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { UserServices } from "../services/userServices";

export class UserGetByIdUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(auth: { userId: string }) {
    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador logado existe, antes de excluir
    const user = await userService.buscarUsuarioPorId(auth.userId);

    // Retorna os dados do usuário encontrado
    return user;
  }
}
