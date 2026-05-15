import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceGetAllByUserIdUseCase } from "../useCases/serviceGetAllByUserIdUseCase";

export class ServiceGetAllByUserIdController {
  constructor(
    private serviceGetAllByUserIdUseCase: ServiceGetAllByUserIdUseCase,
  ) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const { userId } = request.params as { userId: string };

      console.log("userId:", userId);

      const services = await this.serviceGetAllByUserIdUseCase.execute(userId);

      return response.status(200).send(services);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
