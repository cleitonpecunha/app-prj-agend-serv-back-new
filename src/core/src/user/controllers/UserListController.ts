import { FastifyRequest, FastifyReply } from "fastify";
import { UserListUseCase } from "@/core/src/user/useCases/userListUseCase";

export class UserListController {
  constructor(private userListUseCase: UserListUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const users = await this.userListUseCase.execute();

      return response.status(200).send(users);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
