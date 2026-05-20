import { AppointmentDeleteUseCase } from "../useCase/appointmentDeleteUseCase";
import { appointmentParamsSchema } from "../schemas";
import { FastifyRequest, FastifyReply } from "fastify";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";

export class AppointmentDeleteController {
  constructor(private appointmentDeleteUseCase: AppointmentDeleteUseCase) {}

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

    // Executa a lógica de deletar o agendamento
    await this.appointmentDeleteUseCase.execute(paramsParsedID.data.id, auth);

    // Retorna uma resposta de sucesso
    return response.status(204).send();
  }
}
