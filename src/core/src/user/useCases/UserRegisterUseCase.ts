import { IUserRegisterRequestDTO } from "@/core/src/user/dto/UserDTO";
import ICryptoProvider from "@/core/src/user/providers/crypto/ICryptoProvider";
import { IMailProvider } from "@/core/src/user/providers/mail/IMailProvider";
import { IUsersRepository } from "@/core/src/user/repositories/IUserRepository";
import { generateSlug } from "@/lib/slug";
import User from "../model/User";
import { ConflictError } from "@/lib/errors";
import { buildMailUserRegisterInfo } from "../providers/mail/MailUserRegisterInfo";

export class UserRegisterUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private mailProvider: IMailProvider,
    private cryptoProvider: ICryptoProvider,
  ) {}

  async execute(data: IUserRegisterRequestDTO) {
    const slug = generateSlug(data.businessName);

    const [existingEmail, existingSlug] = await Promise.all([
      this.usersRepository.findByEmail(data.email),
      this.usersRepository.findBySlug(slug),
    ]);

    if (existingEmail) {
      throw new ConflictError("Já existe um prestador com este e-mail.");
    }

    if (existingSlug) {
      throw new ConflictError(
        "Já existe um prestador com este nome de negócio.",
      );
    }

    const senhaCripto = this.cryptoProvider.criptografar(data.passwordHash);

    const user = new User({
      ...data,
      slug,
      passwordHash: senhaCripto,
    });

    await this.usersRepository.save(user);

    /* const mailUserRegisterInfo = buildMailUserRegisterInfo({
      userName: data.name,
      descriptionBusinessName: data.businessName,
    });

    await this.mailProvider.sendMail({
      to: {
        name: data.name,
        email: data.email,
      },
      from: {
        name: "Equipe do Meu App",
        email: "equipe@meuapp.com",
      },
      subject: mailUserRegisterInfo.subject,
      body: mailUserRegisterInfo.html,
    }); */
  }
}
