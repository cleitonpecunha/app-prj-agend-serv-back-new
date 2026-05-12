import { IUserUpdateRequestDTO } from "@/core/src/user/dto/userDTO";
import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { generateSlug } from "@/lib/slug";
import User from "@/core/src/user/model/user";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import { updateUserSchema } from "../schemas";
import { assertProviderOwnership } from "@/lib/auth";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class UserUpdateUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(
    id: string,
    auth: { userId: string },
    data: IUserUpdateRequestDTO,
  ) {
    //console.log("Auth userId:", auth.userId);

    const slug = generateSlug(data.businessName);

    const [existingUser, existingSlug] = await Promise.all([
      this.usersRepository.findById(id),
      this.usersRepository.findBySlug(slug),
    ]);

    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    //console.log("Existing user ID:", existingUser.id);

    assertProviderOwnership(auth.userId, existingUser.id!);

    const bodyParsed = parseWith(updateUserSchema, data);
    if (!bodyParsed.success) throw bodyParsed.error;

    if (existingSlug && existingSlug.id !== id) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_NOME_NEGOCIO_JA_CADASTRADO,
      );
    }

    const user = new User({
      ...data,
      slug,
    });

    await this.usersRepository.update(id, user);
  }
}
