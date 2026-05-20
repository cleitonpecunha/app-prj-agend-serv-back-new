import { AppointmentGetAllUseCase } from "../useCase/appointmentGetAllUseCase";
import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";

export class AppointmentGetAllController {
  constructor(private appointmentGetAllUseCase: AppointmentGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verifica autenticação
    const auth = await requireAuth(request);

    // Executa a lógica de obter todos os agendamentos do usuário autenticado
    const appointments = await this.appointmentGetAllUseCase.execute(auth);

    // Retorna a lista de agendamentos do usuário autenticado
    return response.status(200).send(appointments);
  }
}
