import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { AppointmentGetAllUseCase } from "../useCase/appointmentGetAllUseCase";

export class AppointmentGetAllController {
  constructor(private appointmentGetAllUseCase: AppointmentGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    try {
      const appointments = await this.appointmentGetAllUseCase.execute(auth);

      return response.status(200).send(appointments);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
