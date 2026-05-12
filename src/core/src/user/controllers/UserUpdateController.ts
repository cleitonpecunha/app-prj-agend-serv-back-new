import { FastifyRequest, FastifyReply } from "fastify";
import { UserUpdateUseCase } from "@/core/src/user/useCases/UserUpdateUseCase";
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
    const auth = await requireAuth(request);

    const bodyParsed = parseWith(updateUserSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const { name, businessName, phone, address } = request.body;

    try {
      const { id } = request.params as { id: string };
      await this.userUpdateUseCase.execute(id, auth, {
        name,
        businessName,
        phone,
        address,
      });
      return response.status(200).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
