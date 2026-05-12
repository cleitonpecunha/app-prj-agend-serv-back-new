import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceDeleteUseCase } from "../useCases/serviceDeleteUseCase";

export class ServiceDeleteController {
  constructor(private serviceDeleteUseCase: ServiceDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };

      await this.serviceDeleteUseCase.execute(id, auth);

      return response.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
