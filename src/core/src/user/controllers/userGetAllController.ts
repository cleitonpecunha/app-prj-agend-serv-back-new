import { FastifyRequest, FastifyReply } from "fastify";
import { UserGetAllUseCase } from "@/core/src/user/useCases/userGetAllUseCase";

export class UserGetAllController {
  constructor(private userGetAllUseCase: UserGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Executa o caso de uso para obter os dados do usuário logado
    const users = await this.userGetAllUseCase.execute();

    // Retorna os dados do usuário encontrado ou uma resposta de erro se não encontrado
    return response.status(200).send(users);
  }
}
