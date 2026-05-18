import { FastifyRequest, FastifyReply } from "fastify";
import { UserRegisterUseCase } from "@/core/src/user/useCases/userRegisterUseCase";
import { createUserSchema } from "../schemas";
import { parseWith } from "@/lib/validate";
import { IUserAddRequestDTO } from "../dto/userDTO";

export class UserRegisterController {
  constructor(private userRegisterUseCase: UserRegisterUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: IUserAddRequestDTO }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    // Validando os dados de entrada usando o schema definido para criação de usuário
    const parsed = parseWith(createUserSchema, request.body);
    if (!parsed.success) throw parsed.error;

    // Extraindo os dados validados do corpo da requisição
    const { name, businessName, email, passwordHash, phone, address } =
      parsed.data;

    // Executando a lógica de registro do usuário através do caso de uso, passando os dados necessários
    await this.userRegisterUseCase.execute({
      name,
      businessName,
      email,
      passwordHash,
      phone,
      address,
    });

    // Retornando uma resposta de sucesso para o client após o registro do usuário
    return response.status(201).send();
  }
}
