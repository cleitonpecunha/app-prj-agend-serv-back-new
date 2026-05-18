import { FastifyRequest, FastifyReply } from "fastify";
import { UserUpdateUseCase } from "@/core/src/user/useCases/userUpdateUseCase";
import { requireAuth } from "@/lib/auth";
import { parseWith } from "@/lib/validate";
import { updateUserSchema } from "../schemas";
import { IUserUpdateRequestDTO } from "../dto/userDTO";

export class UserUpdateController {
  constructor(private userUpdateUseCase: UserUpdateUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IUserUpdateRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Requer autenticação para obter o ID do usuário logado
    const auth = await requireAuth(request);

    // Valida e transforma os dados de entrada usando o Zod
    const bodyParsed = parseWith(updateUserSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    // Extrai os dados validados para atualizar o usuário
    const { name, businessName, phone, address } = bodyParsed.data;

    // Executa o caso de uso para atualizar os dados do usuário logado
    await this.userUpdateUseCase.execute(auth, {
      name,
      businessName,
      phone,
      address,
    });

    // Retorna uma resposta de sucesso (200 OK) após a atualização do usuário
    return response.status(200).send();
  }
}
