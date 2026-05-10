import { IUserRegisterRequestDTO } from "@/core/src/user/dto/UserDTO";
import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { NotFoundError } from "@/lib/errors";

export class UserListUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute() {
    const users = await this.usersRepository.findMany();

    if (!users || users.length === 0) {
      throw new NotFoundError("Não existem usuários para serem apresentados.");
    }

    return users;
  }
}
