import { FastifyInstance } from "fastify";
import { MailtrapMailProvider } from "./providers/mail/MailProvider";
import { PostgresUsersRepository } from "./repositories/PostgresUserRepository";
import CryptoProviderBcrypt from "./providers/crypto/CryptoProviderBcrypt";
import { UserRegisterController } from "./controllers/UserRegisterController";
import { UserListController } from "./controllers/UserListController";
import { UserGetByIdController } from "./controllers/UserGetByIdController";
import { UserDeleteController } from "./controllers/UserDeleteControler";
import { UserUpdateController } from "./controllers/UserUpdateController";
import { UserRegisterUseCase } from "./useCases/UserRegisterUseCase";
import { UserListUseCase } from "./useCases/UserListUseCase";
import { UserGetByIdUseCase } from "./useCases/UserGetByIdUseCase";
import { UserDeleteUseCase } from "./useCases/UserDeleteUseCase";
import { UserUpdateUseCase } from "./useCases/UserUpdateUseCase";

interface RegisterBody {
  name: string;
  businessName: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
}

interface UpdateBody {
  name: string;
  businessName: string;
  phone: string;
  address: string;
}

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
  app.post<{ Body: RegisterBody }>("/", async (request, reply) => {
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
  app.put<{ Body: UpdateBody }>("/:id", async (request, reply) => {
    return updateUser.handle(request, reply);
  });

  // deletar usuario/prestador logado
  app.delete("/:id", async (request, reply) => {
    return await deleteUser.handle(request, reply);
  });
}
