import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceListUseCase } from "../useCases/serviceListUseCase";

export class ServiceListController {
  constructor(private serviceListUseCase: ServiceListUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const services = await this.serviceListUseCase.execute(auth);

      return response.status(200).send(services);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
