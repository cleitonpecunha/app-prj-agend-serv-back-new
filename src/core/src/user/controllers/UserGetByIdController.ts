import { FastifyRequest, FastifyReply } from "fastify";
import { UserGetByIdUseCase } from "@/core/src/user/useCases/userGetByIdUseCase";
import { requireAuth } from "@/lib/auth";

export class UserGetByIdController {
  constructor(private userGetByIdUseCase: UserGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Requer autenticação para obter o ID do usuário logado
    const auth = await requireAuth(request);

    // Executa o caso de uso para obter os dados do usuário logado
    const user = await this.userGetByIdUseCase.execute(auth);

    // Retorna os dados do usuário encontrado ou uma resposta de erro se não encontrado
    return response.status(200).send(user);
  }
}
