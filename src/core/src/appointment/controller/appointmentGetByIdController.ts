import { AppointmentGetByIdUseCase } from "../useCase/appointmentGetByIdUseCase";
import { appointmentParamsSchema } from "../schemas";
import { FastifyRequest, FastifyReply } from "fastify";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";

export class AppointmentGetByIdController {
  constructor(private appointmentGetByIdUseCase: AppointmentGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verifica autenticação
    const auth = await requireAuth(request);

    // Extrai o ID do agendamento dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do agendamento
    const paramsParsedID = parseWith(appointmentParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Executa a lógica de obter o agendamento pelo ID
    const appointment = await this.appointmentGetByIdUseCase.execute(
      paramsParsedID.data.id,
      auth,
    );

    // Retorna o agendamento encontrado
    return response.status(200).send(appointment);
  }
}
