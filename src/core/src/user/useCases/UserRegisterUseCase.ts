import { IUserAddRequestDTO } from "@/core/src/user/dto/userDTO";
import ICryptoProvider from "@/core/src/user/providers/crypto/ICryptoProvider";
import { IMailProvider } from "@/core/src/user/providers/mail/IMailProvider";
import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { generateSlug } from "@/lib/slug";
import User from "@/core/src/user/model/user";
import { ConflictError } from "@/lib/errors";
import { buildMailUserRegisterInfo } from "../providers/mail/MailUserRegisterInfo";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { env } from "@/config/env";

export class UserRegisterUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private mailProvider: IMailProvider,
    private cryptoProvider: ICryptoProvider,
  ) {}

  async execute(data: IUserAddRequestDTO) {
    const slug = generateSlug(data.businessName);

    const [existingEmail, existingSlug] = await Promise.all([
      this.usersRepository.findByEmail(data.email),
      this.usersRepository.findBySlug(slug),
    ]);

    if (existingEmail) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_EMAIL_JA_CADASTRADO,
      );
    }

    if (existingSlug) {
      throw new ConflictError(
        MensagensPadronizadas.USUARIO_NOME_NEGOCIO_JA_CADASTRADO,
      );
    }

    const senhaCripto = this.cryptoProvider.criptografar(data.passwordHash);

    const user = new User({
      ...data,
      slug,
      passwordHash: senhaCripto,
    });

    await this.usersRepository.save(user);

    const mailUserRegisterInfo = buildMailUserRegisterInfo({
      userName: data.name,
      descriptionBusinessName: data.businessName,
    });

    await this.mailProvider.sendMail({
      to: {
        name: data.name,
        email: data.email,
      },
      from: {
        name: env.MAIL_FROM_NAME,
        email: env.MAIL_FROM_EMAIL,
      },
      subject: mailUserRegisterInfo.subject,
      body: mailUserRegisterInfo.html,
    });
  }
}
