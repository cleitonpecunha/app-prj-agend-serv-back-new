import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceDeleteUseCase } from "../useCases/serviceDeleteUseCase";
import { parseWith } from "@/lib/validate";
import { serviceParamsSchema } from "../schemas";

export class ServiceDeleteController {
  constructor(private serviceDeleteUseCase: ServiceDeleteUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verificar autenticação
    const auth = await requireAuth(request);

    // Extrair o ID do serviço a ser excluído dos parâmetros da rota
    const { id } = request.params as { id: string };

    // valida e parseia o ID do serviço
    const paramsParsedID = parseWith(serviceParamsSchema, { id });
    if (!paramsParsedID.success) throw paramsParsedID.error;

    // Executar a lógica de negócio para excluir o serviço
    await this.serviceDeleteUseCase.execute(paramsParsedID.data.id, auth);

    // Retornar uma resposta de sucesso (204 No Content)
    return response.status(204).send();
  }
}
