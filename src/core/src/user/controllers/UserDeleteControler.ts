import { FastifyRequest, FastifyReply } from "fastify";
import { UserDeleteUseCase } from "@/core/src/user/useCases/userDeleteUseCase";
import { requireAuth } from "@/lib/auth";

export class UserDeleteController {
  constructor(private userDeleteUseCase: UserDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Requer autenticação para obter o ID do usuário logado
    const auth = await requireAuth(request);

    // Executa o caso de uso para excluir o usuário logado
    await this.userDeleteUseCase.execute(auth);

    // Retorna uma resposta de sucesso sem conteúdo (204 No Content)
    return response
      .status(204)
      .send({ message: "Usuário excluído com sucesso." });
  }
}
