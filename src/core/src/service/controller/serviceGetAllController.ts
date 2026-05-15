import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceGetAllUseCase } from "../useCases/serviceGetAllUseCase";

export class ServiceGetAllController {
  constructor(private serviceGetAllUseCase: ServiceGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const services = await this.serviceGetAllUseCase.execute(auth);

      return response.status(200).send(services);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
