import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ScheduleGetAllUseCase } from "../useCase/scheduleGetAllUseCase";

export class ScheduleGetAllController {
  constructor(private scheduleGetAllUseCase: ScheduleGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verifica a autenticação do usuário
    const auth = await requireAuth(request);

    // Executa o caso de uso para obter todos os schedules do usuário autenticado
    const existSchedules = await this.scheduleGetAllUseCase.execute(auth);

    // Retorna os schedules encontrados
    return response.status(200).send(existSchedules);
  }
}
