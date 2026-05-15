import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { AppointmentGetByIdUseCase } from "../useCase/appointmentGetByIdUseCase";

export class AppointmentGetByIdController {
  constructor(private appointmentGetByIdUseCase: AppointmentGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const { id } = request.params as { id: string };

      const appointment = await this.appointmentGetByIdUseCase.execute(
        id,
        auth,
      );

      return response.status(200).send(appointment);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(404).send({
        message,
      });
    }
  }
}
