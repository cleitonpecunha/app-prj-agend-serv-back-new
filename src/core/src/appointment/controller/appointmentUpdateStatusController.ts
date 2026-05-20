import {
  appointmentParamsSchema,
  updateAppointmentStatusSchema,
} from "../schemas";
import { AppointmentUpdateStatusUseCase } from "../useCase/appointmentUpdateStatusUseCase";
import { FastifyRequest, FastifyReply } from "fastify";
import { IAppointmentUpdateRequestDTO } from "../dto/appointmentDTO";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";

export class AppointmentUpdateStatusController {
  constructor(
    private appointmentUpdateStatusUseCase: AppointmentUpdateStatusUseCase,
  ) {}

  async handle(
    request: FastifyRequest<{ Body: IAppointmentUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verifica autenticação
    const auth = await requireAuth(request);

    // Extrai o ID do agendamento dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do agendamento
    const paramsParsedID = parseWith(appointmentParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Valida e parseia o corpo da requisição (status do agendamento)
    const bodyParsedStatus = parseWith(
      updateAppointmentStatusSchema,
      request.body,
    );
    if (!bodyParsedStatus.success) throw bodyParsedStatus.error;

    // Executa a lógica de atualizar o status do agendamento
    await this.appointmentUpdateStatusUseCase.execute(
      paramsParsedID.data.id,
      auth,
      bodyParsedStatus.data,
    );

    // Retorna uma resposta de sucesso
    return response.status(200).send();
  }
}
