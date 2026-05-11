import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceAddUseCase } from "../useCases/serviceAddUseCase";
import { IServiceAddRequestDTO } from "../dto/serviceDTO";
import { requireAuth } from "@/lib/auth";

export class ServiceAddController {
  constructor(private serviceAddUseCase: ServiceAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IServiceAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const {
      id,
      userId,
      name,
      description,
      durationMinutes,
      priceInCents,
      isActive,
    } = request.body;

    try {
      await this.serviceAddUseCase.execute(auth, {
        id,
        userId,
        name,
        description,
        durationMinutes,
        priceInCents,
        isActive,
      });
      return response.status(201).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
