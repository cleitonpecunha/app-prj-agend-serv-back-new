import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { AuthLoginUseCase } from "../useCases/authLoginUseCase";
import JwtProvider from "../providers/jwt/jwtProvider";

export class AuthLoginController {
  constructor(
    private readonly authLoginUseCase: AuthLoginUseCase,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async handle(
    request: FastifyRequest<{ Body: { email: string; passwordHash: string } }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const { email, passwordHash } = request.body;

    try {
      const user = await this.authLoginUseCase.execute({
        email,
        passwordHash,
      });

      const accessToken = this.jwtProvider.gerarAccessToken({
        sub: String(user.id),
        id: user.id,
        name: user.name,
        email: user.email,
        tokenType: "access" as const,
      });

      this.jwtProvider.validarAccessToken(accessToken);

      const refreshToken = this.jwtProvider.gerarRefreshToken({
        sub: String(user.id),
        id: user.id,
        name: user.name,
        email: user.email,
        tokenType: "refresh" as const,
      });

      this.jwtProvider.validarRefreshToken(refreshToken);

      return response.status(200).send({ accessToken, refreshToken });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
