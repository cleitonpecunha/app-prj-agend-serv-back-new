import { FastifyRequest, FastifyReply } from "fastify";
import { ScheduleGetAllByUserIdUseCase } from "../useCase/scheduleGetAllByUserIdUseCase";

export class ScheduleGetAllByUserIdController {
  constructor(
    private scheduleGetAllByUserIdUseCase: ScheduleGetAllByUserIdUseCase,
  ) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const { userId } = request.params as { userId: string };

      //console.log("userId:", userId);

      const schedules =
        await this.scheduleGetAllByUserIdUseCase.execute(userId);

      return response.status(200).send(schedules);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
