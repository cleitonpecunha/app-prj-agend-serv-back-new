import User from "@/core/src/user/model/user";
import { IUserAddRequestDTO } from "@/core/src/user/dto/userDTO";
import ICryptoProvider from "@/core/src/user/providers/crypto/ICryptoProvider";
import { IMailProvider } from "@/core/src/shared/providerEmail/IMailProvider";
import { IUsersRepository } from "@/core/src/user/repositories/IUsersRepository";
import { generateSlug } from "@/lib/slug";
import { buildMailUserRegisterInfo } from "../../shared/templateEmail/MailUserRegisterInfo";
import { env } from "@/config/env";
import { UserServices } from "../services/userServices";

export class UserRegisterUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private mailProvider: IMailProvider,
    private cryptoProvider: ICryptoProvider,
  ) {}

  async execute(data: IUserAddRequestDTO) {
    // instanciando o serviço de usuário para validar as regras de negócio relacionadas a um novo usuário
    const userService = new UserServices(this.usersRepository);

    // Gerando o slug a partir do nome do negócio
    const slug = generateSlug(data.businessName);

    // Validando as regras de negócio para um novo usuário, como verificar se o email ou slug já estão cadastrados
    await userService.validarRegraNovoUsuario(data.email, slug);

    // Criptografando a senha do usuário antes de salvar no banco de dados
    const senhaCripto = this.cryptoProvider.criptografar(data.passwordHash);

    // Criando a instância do usuário com os dados fornecidos, incluindo o slug gerado e a senha criptografada
    const user = new User({
      ...data,
      slug,
      passwordHash: senhaCripto,
    });

    // Salvando o usuário no banco de dados através do repositório de usuários
    await this.usersRepository.save(user);

    // Construindo o conteúdo do email de registro do usuário
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
        name: env.MAIL_FROM_NAME,
        email: env.MAIL_FROM_EMAIL,
      },
      subject: mailUserRegisterInfo.subject,
      body: mailUserRegisterInfo.html,
    }); */
  }
}
