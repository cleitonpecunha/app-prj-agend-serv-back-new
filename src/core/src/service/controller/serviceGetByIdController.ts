import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceGetByIdUseCase } from "../useCases/serviceGetByIdUseCase";
import { parseWith } from "@/lib/validate";
import { serviceParamsSchema } from "../schemas";

export class ServiceGetByIdController {
  constructor(private serviceGetByIdUseCase: ServiceGetByIdUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // extrai o id do serviço dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do serviço
    const paramsParsedID = parseWith(serviceParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // executa a lógica de obtenção do serviço por ID
    const existService = await this.serviceGetByIdUseCase.execute(
      paramsParsedID.data.id,
      auth,
    );

    // retorna o serviço encontrado
    return response.status(200).send(existService);
  }
}
