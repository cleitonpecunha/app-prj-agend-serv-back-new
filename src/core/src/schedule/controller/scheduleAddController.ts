import { addScheduleSchema } from "../schemas";
import { FastifyRequest, FastifyReply } from "fastify";
import { IScheduleAddRequestDTO } from "../dto/scheduleDTO";
import { parseWith } from "@/lib/validate";
import { requireAuth } from "@/lib/auth";
import { ScheduleAddUseCase } from "../useCase/scheduleAddUseCase";

export class ScheduleAddController {
  constructor(private scheduleAddUseCase: ScheduleAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IScheduleAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // valida e parseia o body da requisição
    const bodyParsed = parseWith(addScheduleSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // executa a lógica de negócio para adicionar um novo schedule
    await this.scheduleAddUseCase.execute(auth, bodyParsed.data);

    // retorna uma resposta de sucesso
    return response.status(201).send();
  }
}
