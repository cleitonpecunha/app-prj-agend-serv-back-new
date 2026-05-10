import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";

export class UserGetByIdUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(id: string, auth: { userId: string }) {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    //console.log("Existing user:", existingUser);
    //console.log("Auth user ID:", auth.userId);

    assertProviderOwnership(auth.userId, existingUser.id!);

    return existingUser;
  }
}
