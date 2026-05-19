import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceGetAllByUserIdUseCase } from "../useCases/serviceGetAllByUserIdUseCase";
import { parseWith } from "@/lib/validate";
import { userParamsSchema } from "../../user/schemas";

export class ServiceGetAllByUserIdController {
  constructor(
    private serviceGetAllByUserIdUseCase: ServiceGetAllByUserIdUseCase,
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

    // Executa o caso de uso para obter todos os serviços do usuário informado
    const existServices = await this.serviceGetAllByUserIdUseCase.execute(
      paramsParsedID.data.id,
    );

    // Retorna os serviços encontrados
    return response.status(200).send(existServices);
  }
}
