import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceUpdateUseCase } from "../useCases/serviceUpdateUseCase";
import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";
import { parseWith } from "@/lib/validate";
import { updateServiceSchema } from "../schemas";

export class ServiceUpdateController {
  constructor(private serviceUpdateUseCase: ServiceUpdateUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IServiceUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const bodyParsed = parseWith(updateServiceSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const { name, description, durationMinutes, priceInCents, isActive } =
      request.body;

    try {
      const { id } = request.params as { id: string };
      await this.serviceUpdateUseCase.execute(id, auth, {
        name,
        description,
        durationMinutes,
        priceInCents,
        isActive,
      });
      return response.status(200).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
