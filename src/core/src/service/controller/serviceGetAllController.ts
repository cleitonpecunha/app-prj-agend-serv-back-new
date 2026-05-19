import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { ServiceGetAllUseCase } from "../useCases/serviceGetAllUseCase";

export class ServiceGetAllController {
  constructor(private serviceGetAllUseCase: ServiceGetAllUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Verifica a autenticação do usuário
    const auth = await requireAuth(request);

    // Executa o caso de uso para obter todos os serviços do usuário autenticado
    const existServices = await this.serviceGetAllUseCase.execute(auth);

    // Retorna os serviços encontrados
    return response.status(200).send(existServices);
  }
}
