import { FastifyInstance } from "fastify";
import { PostgresUsersRepository } from "../user/repositories/PostgresUserRepository";
import CryptoProviderBcrypt from "../user/providers/crypto/CryptoProviderBcrypt";
import { AuthLoginUseCase } from "./useCase/AuthLoginUseCase";
import { AuthLoginController } from "./controller/AuthLoginController";
import { parseWith } from "@/lib/validate";
import { loginSchema } from "./schemas";
import JwtProvider from "./provider/jwt/JwtProvider";
import { env } from "@/config/env";

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
    const parsed = parseWith(loginSchema, request.body);
    if (!parsed.success) throw parsed.error;

    //const provider = await authenticateProvider(parsed.data);
    //const tokens = await issueTokenPair(app, provider);

    //return reply.send(
    //toAuthResponse(tokens.accessToken, tokens.refreshToken, provider),
    //);
    return authUser.handle(request, reply);
  });
}
