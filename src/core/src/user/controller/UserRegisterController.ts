import { FastifyRequest, FastifyReply } from "fastify";
import { UserRegisterUseCase } from "@/core/src/user/useCases/UserRegisterUseCase";

interface RegisterBody {
  name: string;
  businessName: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
}

export class UserRegisterController {
  constructor(private userRegisterUseCase: UserRegisterUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: RegisterBody }>,
    response: FastifyReply,
  ): Promise<FastifyReply> {
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
