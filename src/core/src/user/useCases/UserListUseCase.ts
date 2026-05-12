import { NotFoundError } from "@/lib/errors";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class UserListUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute() {
    const users = await this.usersRepository.findMany();

    if (!users || users.length === 0) {
      throw new NotFoundError(MensagensPadronizadas.USUARIOS_NAO_ENCONTRADOS);
    }

    return users;
  }
}
