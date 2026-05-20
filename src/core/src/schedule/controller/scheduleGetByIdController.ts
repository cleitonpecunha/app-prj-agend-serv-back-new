import { FastifyRequest, FastifyReply } from "fastify";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";
import { ScheduleGetByIdUseCase } from "../useCase/scheduleGetByIdUseCase";
import { scheduleParamsSchema } from "../schemas";

export class ScheduleGetByIdController {
  constructor(private scheduleGetByIdUseCase: ScheduleGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // extrai o id do schedule dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do schedule
    const paramsParsedID = parseWith(scheduleParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // executa a lógica de negócio para obter o schedule pelo ID
    const existSchedule = await this.scheduleGetByIdUseCase.execute(
      paramsParsedID.data.id,
      auth,
    );

    // retorna o schedule encontrado
    return response.status(200).send(existSchedule);
  }
}
