import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { parseWith } from "@/lib/validate";
import { AppointmentUpdateStatusUseCase } from "../useCase/appointmentUpdateStatusUseCase";
import { IAppointmentUpdateRequestDTO } from "../dto/appointmentDTO";
import { updateAppointmentStatusSchema } from "../schemas";

export class AppointmentUpdateStatusController {
  constructor(
    private appointmentUpdateStatusUseCase: AppointmentUpdateStatusUseCase,
  ) {}

  async handle(
    request: FastifyRequest<{ Body: IAppointmentUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const bodyParsed = parseWith(updateAppointmentStatusSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const { status } = request.body;

    try {
      const { id } = request.params as { id: string };
      await this.appointmentUpdateStatusUseCase.execute(id, auth, {
        status,
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
