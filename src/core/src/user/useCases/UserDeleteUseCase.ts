import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";

export class UserDeleteUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(id: string, auth: { userId: string }) {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    assertProviderOwnership(auth.userId, existingUser.id!);

    await this.usersRepository.delete(id);
  }
}
