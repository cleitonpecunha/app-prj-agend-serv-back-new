import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { parseWith } from "@/lib/validate";
import { ScheduleUpdateUseCase } from "../useCase/scheduleUpdateUseCase";
import { IScheduleUpdateRequestDTO } from "../dto/scheduleDTO";
import { updateScheduleSchema } from "../schemas";

export class ScheduleUpdateController {
  constructor(private scheduleUpdateUseCase: ScheduleUpdateUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IScheduleUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const bodyParsed = parseWith(updateScheduleSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const { dayOfWeek, startTime, endTime, isActive } = request.body;

    try {
      const { id } = request.params as { id: string };
      await this.scheduleUpdateUseCase.execute(id, auth, {
        dayOfWeek,
        startTime,
        endTime,
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
