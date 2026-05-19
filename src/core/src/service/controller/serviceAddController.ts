import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceAddUseCase } from "../useCases/serviceAddUseCase";
import { IServiceAddRequestDTO } from "../dto/serviceDTO";
import { requireAuth } from "@/lib/auth";
import { parseWith } from "@/lib/validate";
import { addServiceSchema } from "../schemas";

export class ServiceAddController {
  constructor(private serviceAddUseCase: ServiceAddUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IServiceAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // valida autenticação
    const auth = await requireAuth(request);

    // valida e parseia o body da requisição
    const bodyParsed = parseWith(addServiceSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // executa a lógica de negócio para adicionar um novo serviço
    await this.serviceAddUseCase.execute(auth, bodyParsed.data);

    // retorna uma resposta de sucesso
    return response.status(201).send();
  }
}
