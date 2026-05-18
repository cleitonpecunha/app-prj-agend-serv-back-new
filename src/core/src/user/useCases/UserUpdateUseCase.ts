import User from "@/core/src/user/model/user";
import { generateSlug } from "@/lib/slug";
import { IUserUpdateRequestDTO } from "@/core/src/user/dto/userDTO";
import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { UserServices } from "../services/userServices";

export class UserUpdateUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(auth: { userId: string }, data: IUserUpdateRequestDTO) {
    // Gerando o slug a partir do nome do negócio
    const slug = generateSlug(data.businessName);

    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // Valida se o usuário/pretador logado existe, antes de excluir
    await userService.validarRegraAtualizarUsuario(auth.userId, slug);

    // Criando a instância do usuário com os dados fornecidos, incluindo o slug gerado e a senha criptografada
    const user = new User({
      ...data,
      slug,
    });

    // Atualizando o usuário no banco de dados através do repositório de usuários
    await this.usersRepository.update(auth.userId, user);
  }
}
