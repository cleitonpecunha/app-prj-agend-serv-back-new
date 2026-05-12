import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceGetByUserIdUseCase } from "../useCases/serviceGetByUserIdUseCase";

export class ServiceGetByUserIdController {
  constructor(private serviceGetByUserIdUseCase: ServiceGetByUserIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const { userId } = request.params as { userId: string };

      console.log("userId:", userId);

      const services = await this.serviceGetByUserIdUseCase.execute(userId);

      return response.status(200).send(services);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
