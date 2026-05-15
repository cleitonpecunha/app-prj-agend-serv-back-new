import { FastifyRequest, FastifyReply } from "fastify";
import { UserGetAllUseCase } from "@/core/src/user/useCases/userGetAllUseCase";

export class UserGetAllController {
  constructor(private userGetAllUseCase: UserGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const users = await this.userGetAllUseCase.execute();

      return response.status(200).send(users);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
