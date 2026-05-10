import { FastifyInstance } from "fastify";
import { parseWith } from "@/lib/validate";
import { createUserSchema } from "./schemas";
import { MailtrapMailProvider } from "./providers/mail/MailProvider";
import CryptoProviderBcrypt from "./providers/crypto/CryptoProviderBcrypt";
import { UserRegisterController } from "./controller/UserRegisterController";
import { UserListController } from "./controller/UserListController";
import { UserGetByIdController } from "./controller/UserGetByIdController";
import { UserDeleteController } from "./controller/UserDeleteControler";
import { UserRegisterUseCase } from "./useCases/UserRegisterUseCase";
import { UserListUseCase } from "./useCases/UserListUseCase";
import { UserGetByIdUseCase } from "./useCases/UserGetByIdUseCase";
import { UserDeleteUseCase } from "./useCases/UserDeleteUseCase";
import { UserUpdateUseCase } from "./useCases/UserUpdateUseCase";
import { UserUpdateController } from "./controller/UserUpdateController";
import { PostgresUsersRepository } from "./repositories/PostgresUserRepository";

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

  // registrar usuarios
  app.post<{ Body: RegisterBody }>("/", async (request, reply) => {
    const parsed = parseWith(createUserSchema, request.body);
    if (!parsed.success) throw parsed.error;

    return registerUser.handle(request, reply);
  });

  // listaar todos os usuarios
  app.get("/", async (_request, reply) => {
    return await listUsers.handle(_request, reply);
  });

  // buscar usuario por ID
  app.get("/:id", async (request, reply) => {
    return await getUserById.handle(request, reply);
  });

  // atualizar usuarios
  app.put<{ Body: UpdateBody }>("/:id", async (request, reply) => {
    return updateUser.handle(request, reply);
  });

  // deletar usuarios
  app.delete("/:id", async (request, reply) => {
    return await deleteUser.handle(request, reply);
  });
}
