import { FastifyInstance } from "fastify";
import { PostgresUsersRepository } from "../user/repositories/PostgresUserRepository";
import CryptoProviderBcrypt from "../user/providers/crypto/CryptoProviderBcrypt";
import JwtProvider from "./providers/jwt/jwtProvider";
import { env } from "@/config/env";
import { AuthLoginController } from "./controllers/authLoginController";
import { AuthLoginUseCase } from "./useCases/authLoginUseCase";

interface AuthLoginBody {
  email: string;
  passwordHash: string;
}

export async function authRoutes(app: FastifyInstance) {
  const usersRepository = new PostgresUsersRepository();
  const cryptoProvider = new CryptoProviderBcrypt();
  const jwtProvider = new JwtProvider(env.JWT_SECRET, env.JWT_REFRESH_SECRET);

  // Instanciar o UseCase com as dependências
  const authLoginUseCase = new AuthLoginUseCase(
    usersRepository,
    cryptoProvider,
  );

  // Instanciar o Controller com o UseCase
  const authUser = new AuthLoginController(authLoginUseCase, jwtProvider);

  app.post<{ Body: AuthLoginBody }>("/login", async (request, reply) => {
    return authUser.handle(request, reply);
  });
}
