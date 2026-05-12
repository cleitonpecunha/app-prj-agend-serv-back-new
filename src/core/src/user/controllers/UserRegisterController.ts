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
    const parsed = parseWith(createUserSchema, request.body);
    if (!parsed.success) throw parsed.error;

    const { name, businessName, slug, email, passwordHash, phone, address } =
      request.body;

    try {
      await this.userRegisterUseCase.execute({
        name,
        businessName,
        slug,
        email,
        passwordHash,
        phone,
        address,
      });
      return response.status(201).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
