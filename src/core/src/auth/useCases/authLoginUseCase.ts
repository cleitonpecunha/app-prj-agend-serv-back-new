import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import ICryptoProvider from "../../user/providers/crypto/ICryptoProvider";
import { IAuthLoginRequestDTO } from "../dto/authDTO";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class AuthLoginUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private cryptoProvider: ICryptoProvider,
  ) {}

  async execute(login: IAuthLoginRequestDTO) {
    const user = await this.usersRepository.findByEmail(login.email);

    if (!user) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    const isPasswordValid = await this.cryptoProvider.comparar(
      login.passwordHash,
      user.passwordHash!,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(MensagensPadronizadas.CREDENCIAIS_INVALIDAS);
    }

    return user;
  }
}
