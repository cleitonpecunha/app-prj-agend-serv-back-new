import { FastifyRequest, FastifyReply } from "fastify";
import { AppointmentAddUseCase } from "../useCase/appointmentAddUseCase";
import { IAppointmentAddRequestDTO } from "../dto/appointmentDTO";
import { parseWith } from "@/lib/validate";
import { addAppointmentSchema } from "../schemas";

export class AppointmentAddController {
  constructor(private appointmentAddUseCase: AppointmentAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IAppointmentAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const parsed = parseWith(addAppointmentSchema, request.body);
    if (!parsed.success) throw parsed.error;

    const {
      appointmentDate,
      startTime,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = request.body;

    try {
      const { serviceId } = request.params as { serviceId: string };
      await this.appointmentAddUseCase.execute(serviceId, {
        appointmentDate,
        startTime,
        clientName,
        clientEmail,
        clientPhone,
        notes,
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
