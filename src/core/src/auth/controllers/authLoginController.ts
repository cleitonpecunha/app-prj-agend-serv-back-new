import { FastifyRequest, FastifyReply } from "fastify";
import { AuthLoginUseCase } from "../useCases/authLoginUseCase";
import { parseWith } from "@/lib/validate";
import { loginSchema } from "../schemas";
import { IAuthLoginRequestDTO } from "../dto/authDTO";

export class AuthLoginController {
  constructor(private readonly authLoginUseCase: AuthLoginUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IAuthLoginRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Validar os dados de entrada usando o Zod
    const parsed = parseWith(loginSchema, request.body);
    if (!parsed.success) throw parsed.error;

    // Extrair os dados validados
    const { email, passwordHash } = parsed.data;

    const { usuario, accessToken, refreshToken } =
      await this.authLoginUseCase.execute({
        email,
        passwordHash,
      });

    return response.status(200).send({ usuario, accessToken, refreshToken });
  }
}
