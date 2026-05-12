import { FastifyRequest, FastifyReply } from "fastify";
import { UserDeleteUseCase } from "../useCases/UserDeleteUseCase";
import { requireAuth } from "@/lib/auth";

export class UserDeleteController {
  constructor(private userDeleteUseCase: UserDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };

      await this.userDeleteUseCase.execute(id, auth);

      return response
        .status(204)
        .send({ message: "Usuário excluído com sucesso." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
