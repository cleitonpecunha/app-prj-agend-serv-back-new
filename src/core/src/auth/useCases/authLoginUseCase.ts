import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import ICryptoProvider from "../../user/providers/crypto/ICryptoProvider";
import { IAuthLoginRequestDTO } from "../dto/authDTO";
import { UserServices } from "../../user/services/userServices";
import JwtProvider from "../providers/jwt/jwtProvider";
import { AuthServices } from "../services/authServices";

export class AuthLoginUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly cryptoProvider: ICryptoProvider,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async execute(data: IAuthLoginRequestDTO) {
    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // instanciando o serviço de autenticação para validar as credenciais do usuário
    const authService = new AuthServices(this.cryptoProvider, this.jwtProvider);

    // Valida se o usuário/pretador logado existe, antes de excluir
    const usuario = await userService.buscarUsuarioPorEmail(data.email);

    // Caso as credenciais sejam inválidas, lançar um erro de autenticação
    await authService.validarCredenciais(
      data.passwordHash,
      usuario.passwordHash!,
    );

    // Gerar "accessToken" de autenticação (ex: JWT) para o usuário
    const accessToken = await authService.gerarToken({
      sub: usuario.id!,
      id: usuario.id!,
      name: usuario.name!,
      email: usuario.email!,
      tokenType: "access",
    });

    // Validar o "accessToken" gerado para garantir que é um token válido e pode ser usado para autenticação
    await authService.validarToken(accessToken!, "access");

    // Gerar "refreshToken" de autenticação (ex: JWT) para o usuário
    const refreshToken = await authService.gerarToken({
      sub: usuario.id!,
      id: usuario.id!,
      name: usuario.name!,
      email: usuario.email!,
      tokenType: "refresh",
    });

    // Validar o "refreshToken" gerado para garantir que é um token válido e pode ser usado para autenticação
    await authService.validarToken(refreshToken!, "refresh");

    return { usuario, accessToken, refreshToken };
  }
}
