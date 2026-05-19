import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceUpdateUseCase } from "../useCases/serviceUpdateUseCase";
import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";
import { parseWith } from "@/lib/validate";
import { serviceParamsSchema, updateServiceSchema } from "../schemas";

export class ServiceUpdateController {
  constructor(private serviceUpdateUseCase: ServiceUpdateUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IServiceUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // extrai o id do serviço dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do serviço
    const paramsParsedID = parseWith(serviceParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // valida e parseia o body da requisição do serviço
    const bodyParsed = parseWith(updateServiceSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // executa a lógica de atualização do serviço
    await this.serviceUpdateUseCase.execute(
      paramsParsedID.data.id,
      auth,
      bodyParsed.data,
    );

    // retorna uma resposta de sucesso
    return response.status(200).send();
  }
}
