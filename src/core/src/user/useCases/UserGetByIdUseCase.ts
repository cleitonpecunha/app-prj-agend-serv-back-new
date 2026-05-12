import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { assertProviderOwnership } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class UserGetByIdUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(id: string, auth: { userId: string }) {
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    //console.log("Existing user:", existingUser);
    //console.log("Auth user ID:", auth.userId);

    assertProviderOwnership(auth.userId, existingUser.id!);

    return existingUser;
  }
}
