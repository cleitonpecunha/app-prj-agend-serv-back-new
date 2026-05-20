import { FastifyRequest, FastifyReply } from "fastify";
import { parseWith } from "@/lib/validate";
import { ScheduleGetAllByUserIdUseCase } from "../useCase/scheduleGetAllByUserIdUseCase";
import { userParamsSchema } from "../../user/schemas";

export class ScheduleGetAllByUserIdController {
  constructor(
    private scheduleGetAllByUserIdUseCase: ScheduleGetAllByUserIdUseCase,
  ) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Extrai o userId dos parâmetros da rota
    const { userId } = request.params as { userId: string };

    // valida e parseia o ID do usuário
    const paramsParsedID = parseWith(userParamsSchema, { id: userId });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Executa o caso de uso para obter todos os schedules do usuário informado
    const existSchedules = await this.scheduleGetAllByUserIdUseCase.execute(
      paramsParsedID.data.id,
    );

    // Retorna os schedules encontrados
    return response.status(200).send(existSchedules);
  }
}
