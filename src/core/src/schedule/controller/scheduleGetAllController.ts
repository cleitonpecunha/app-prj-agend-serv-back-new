import { FastifyRequest, FastifyReply } from "fastify";
import { ScheduleGetAllUseCase } from "../useCase/scheduleGetAllUseCase";
import { requireAuth } from "@/lib/auth";

export class ScheduleGetAllController {
  constructor(private scheduleGetAllUseCase: ScheduleGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);
    try {
      const schedules = await this.scheduleGetAllUseCase.execute(auth);

      return response.status(200).send(schedules);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
