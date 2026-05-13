import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { parseWith } from "@/lib/validate";
import { ScheduleAddUseCase } from "../useCase/scheduleAddUseCase";
import { IScheduleAddRequestDTO } from "../dto/scheduleDTO";
import { addScheduleSchema } from "../schemas";

export class ScheduleAddController {
  constructor(private scheduleAddUseCase: ScheduleAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IScheduleAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const parsed = parseWith(addScheduleSchema, request.body);
    if (!parsed.success) throw parsed.error;

    const { id, userId, dayOfWeek, startTime, endTime, isActive } =
      request.body;

    try {
      await this.scheduleAddUseCase.execute(auth, {
        id,
        userId,
        dayOfWeek,
        startTime,
        endTime,
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
