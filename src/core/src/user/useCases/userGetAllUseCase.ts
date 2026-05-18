import { IUsersRepository } from "../repositories/IUsersRepository";
import { UserServices } from "../services/userServices";

export class UserGetAllUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute() {
    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador logado existe, antes de excluir
    const users = await userService.buscarTodosUsuarios();

    // Retorna os dados do usuário encontrado
    return users;
  }
}
