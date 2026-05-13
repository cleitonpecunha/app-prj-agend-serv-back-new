import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ScheduleDeleteUseCase } from "../useCase/scheduleDeleteUseCase";

export class ScheduleDeleteController {
  constructor(private scheduleDeleteUseCase: ScheduleDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };

      await this.scheduleDeleteUseCase.execute(id, auth);

      return response.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(404).send({
        message,
      });
    }
  }
}
