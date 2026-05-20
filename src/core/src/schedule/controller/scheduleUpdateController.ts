import { FastifyRequest, FastifyReply } from "fastify";
import { IScheduleUpdateRequestDTO } from "../dto/scheduleDTO";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";
import { scheduleParamsSchema, updateScheduleSchema } from "../schemas";
import { ScheduleUpdateUseCase } from "../useCase/scheduleUpdateUseCase";

export class ScheduleUpdateController {
  constructor(private scheduleUpdateUseCase: ScheduleUpdateUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IScheduleUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // extrai o id do schedule dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do schedule
    const paramsParsedID = parseWith(scheduleParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // valida e parseia o body da requisição do schedule
    const bodyParsed = parseWith(updateScheduleSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // executa a lógica de atualização do schedule
    await this.scheduleUpdateUseCase.execute(
      paramsParsedID.data.id,
      auth,
      bodyParsed.data,
    );

    // retorna uma resposta de sucesso
    return response.status(200).send();
  }
}
