import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ScheduleGetByIdUseCase } from "../useCase/scheduleGetByIdUseCase";

export class ScheduleGetByIdController {
  constructor(private scheduleGetByIdUseCase: ScheduleGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };
      const schedule = await this.scheduleGetByIdUseCase.execute(id, auth);

      return response.status(200).send(schedule);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
