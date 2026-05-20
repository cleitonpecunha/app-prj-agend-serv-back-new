import { FastifyRequest, FastifyReply } from "fastify";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";
import { ScheduleDeleteUseCase } from "../useCase/scheduleDeleteUseCase";
import { scheduleParamsSchema } from "../schemas";

export class ScheduleDeleteController {
  constructor(private scheduleDeleteUseCase: ScheduleDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verificar autenticação
    const auth = await requireAuth(request);

    // Extrair o ID do schedule a ser excluído dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do schedule
    const paramsParsedID = parseWith(scheduleParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Executar a lógica de negócio para excluir o schedule
    await this.scheduleDeleteUseCase.execute(paramsParsedID.data.id, auth);

    // Retornar uma resposta de sucesso (204 No Content)
    return response.status(204).send();
  }
}
