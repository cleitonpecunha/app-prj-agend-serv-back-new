import { FastifyRequest, FastifyReply } from "fastify";
import { UserGetByIdUseCase } from "@/core/src/user/useCases/userGetByIdUseCase";
import { requireAuth } from "@/lib/auth";

export class UserGetByIdController {
  constructor(private userGetByIdUseCase: UserGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };

      //console.log("ID do usuário a ser buscado:", id);

      const user = await this.userGetByIdUseCase.execute(id, auth);

      return response.status(200).send(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
