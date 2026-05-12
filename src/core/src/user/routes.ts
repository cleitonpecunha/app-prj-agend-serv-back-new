import { FastifyInstance } from "fastify";
import { MailtrapMailProvider } from "./providers/mail/MailProvider";
import { PostgresUsersRepository } from "./repositories/PostgresUsersRepository";
import CryptoProviderBcrypt from "./providers/crypto/CryptoProviderBcrypt";
import { UserRegisterController } from "./controllers/userRegisterController";
import { UserListController } from "./controllers/userListController";
import { UserGetByIdController } from "./controllers/userGetByIdController";
import { UserDeleteController } from "./controllers/userDeleteControler";
import { UserUpdateController } from "./controllers/userUpdateController";
import { UserRegisterUseCase } from "./useCases/userRegisterUseCase";
import { UserListUseCase } from "./useCases/userListUseCase";
import { UserGetByIdUseCase } from "./useCases/userGetByIdUseCase";
import { UserDeleteUseCase } from "./useCases/userDeleteUseCase";
import { UserUpdateUseCase } from "./useCases/userUpdateUseCase";
import { IUserAddRequestDTO, IUserUpdateRequestDTO } from "./dto/userDTO";

export async function userRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const usersRepository = new PostgresUsersRepository();
  const mailProvider = new MailtrapMailProvider();
  const cryptoProvider = new CryptoProviderBcrypt();

  // Instanciar o UseCase com as dependências
  const userRegisterUseCase = new UserRegisterUseCase(
    usersRepository,
    mailProvider,
    cryptoProvider,
  );
  const userListUseCase = new UserListUseCase(usersRepository);
  const userGetByIdUseCase = new UserGetByIdUseCase(usersRepository);
  const userDeleteUseCase = new UserDeleteUseCase(usersRepository);
  const userUpdateUseCase = new UserUpdateUseCase(usersRepository);

  // Instanciar o Controller com o UseCase
  const registerUser = new UserRegisterController(userRegisterUseCase);
  const listUsers = new UserListController(userListUseCase);
  const getUserById = new UserGetByIdController(userGetByIdUseCase);
  const deleteUser = new UserDeleteController(userDeleteUseCase);
  const updateUser = new UserUpdateController(userUpdateUseCase);

  // registrar usuario/prestador
  app.post<{ Body: IUserAddRequestDTO }>("/", async (request, reply) => {
    return registerUser.handle(request, reply);
  });

  // listar todos os usuarios/prestadores
  app.get("/", async (_request, reply) => {
    return await listUsers.handle(_request, reply);
  });

  // buscar usuario/prestador por ID
  app.get("/:id", async (request, reply) => {
    return await getUserById.handle(request, reply);
  });

  // atualizar usuario/prestador logado
  app.put<{ Body: IUserUpdateRequestDTO }>("/:id", async (request, reply) => {
    return updateUser.handle(request, reply);
  });

  // deletar usuario/prestador logado
  app.delete("/:id", async (request, reply) => {
    return await deleteUser.handle(request, reply);
  });
}
