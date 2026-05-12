import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceGetByIdUseCase } from "../useCases/serviceGetByIdUseCase";

export class ServiceGetByIdController {
  constructor(private serviceGetByIdUseCase: ServiceGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };
      const service = await this.serviceGetByIdUseCase.execute(id, auth);

      return response.status(200).send(service);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
