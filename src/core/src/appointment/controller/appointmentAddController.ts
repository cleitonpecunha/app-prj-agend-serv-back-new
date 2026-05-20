import { addAppointmentSchema } from "../schemas";
import { AppointmentAddUseCase } from "../useCase/appointmentAddUseCase";
import { FastifyRequest, FastifyReply } from "fastify";
import { IAppointmentAddRequestDTO } from "../dto/appointmentDTO";
import { parseWith } from "@/lib/validate";
import { serviceParamsSchema } from "../../service/schemas";

export class AppointmentAddController {
  constructor(private appointmentAddUseCase: AppointmentAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IAppointmentAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Extrai o ID do serviço dos parâmetros da rota
    const { serviceId } = request.params as { serviceId: string };

    // valida e parseia o ID do serviço
    const paramsParsedID = parseWith(serviceParamsSchema, { id: serviceId });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Valida e parseia o corpo da requisição
    const bodyParsed = parseWith(addAppointmentSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // Executa a lógica de adicionar o agendamento
    await this.appointmentAddUseCase.execute(
      paramsParsedID.data.id,
      bodyParsed.data,
    );

    // Retorna uma resposta de sucesso
    return response.status(201).send();
  }
}
