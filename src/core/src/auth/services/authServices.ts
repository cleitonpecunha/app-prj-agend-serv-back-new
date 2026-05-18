import ICryptoProvider from "@/core/src/user/providers/crypto/ICryptoProvider";
import { UnauthorizedError } from "@/lib/errors";
import JwtProvider from "../providers/jwt/jwtProvider";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class AuthServices {
  constructor(
    private readonly cryptoProvider: ICryptoProvider,
    private readonly jwtProvider: JwtProvider,
  ) {}

  // Método para validar as credenciais do usuário durante o login, comparando a senha fornecida com a senha armazenada no banco de dados
  async validarCredenciais(passwordAuth: string, passwordUser: string) {
    const isPasswordValid = await this.cryptoProvider.comparar(
      passwordAuth,
      passwordUser,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(MensagensPadronizadas.CREDENCIAIS_INVALIDAS);
    }
  }

  // Método para gerar um token de autenticação (ex: JWT) com base no payload fornecido, que pode incluir informações do usuário como ID, nome e email
  async gerarToken(payload: {
    sub: string;
    id: string;
    name: string;
    email: string;
    tokenType: "access" | "refresh";
  }) {
    if (payload.tokenType === "access") {
      return this.jwtProvider.gerarAccessToken(payload);
    } else if (payload.tokenType === "refresh") {
      return this.jwtProvider.gerarRefreshToken(payload);
    }
  }

  async validarToken(token: string, tokenType: "access" | "refresh") {
    try {
      if (tokenType === "access") {
        return this.jwtProvider.validarAccessToken(token);
      } else if (tokenType === "refresh") {
        return this.jwtProvider.validarRefreshToken(token);
      }
    } catch (err) {
      throw new UnauthorizedError(MensagensPadronizadas.TOKEN_INVALIDO);
    }
  }
}
