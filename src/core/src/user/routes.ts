import { FastifyInstance } from "fastify";
import { MailtrapMailProvider } from "../shared/providerEmail/MailProvider";
import { PostgresUsersRepository } from "./repositories/PostgresUsersRepository";
import CryptoProviderBcrypt from "./providers/crypto/CryptoProviderBcrypt";
import { UserRegisterController } from "./controllers/UserRegisterController";
import { UserGetByIdController } from "./controllers/UserGetByIdController";
import { UserUpdateController } from "./controllers/UserUpdateController";
import { UserRegisterUseCase } from "./useCases/userRegisterUseCase";
import { UserGetAllUseCase } from "./useCases/userGetAllUseCase";
import { UserGetByIdUseCase } from "./useCases/userGetByIdUseCase";
import { UserDeleteUseCase } from "./useCases/userDeleteUseCase";
import { UserUpdateUseCase } from "./useCases/userUpdateUseCase";
import { IUserAddRequestDTO, IUserUpdateRequestDTO } from "./dto/userDTO";
import { UserGetAllController } from "./controllers/userGetAllController";
import { UserDeleteController } from "./controllers/userDeleteControler";

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
  const userGetAllUseCase = new UserGetAllUseCase(usersRepository);
  const userGetByIdUseCase = new UserGetByIdUseCase(usersRepository);
  const userDeleteUseCase = new UserDeleteUseCase(usersRepository);
  const userUpdateUseCase = new UserUpdateUseCase(usersRepository);

  // Instanciar o Controller com o UseCase
  const registerUser = new UserRegisterController(userRegisterUseCase);
  const listGetAll = new UserGetAllController(userGetAllUseCase);
  const getUserById = new UserGetByIdController(userGetByIdUseCase);
  const deleteUser = new UserDeleteController(userDeleteUseCase);
  const updateUser = new UserUpdateController(userUpdateUseCase);

  // registrar usuario/prestador
  app.post<{ Body: IUserAddRequestDTO }>("/", async (request, reply) => {
    return registerUser.handle(request, reply);
  });

  // listar todos os usuarios/prestadores
  app.get("/todos", async (_request, reply) => {
    return await listGetAll.handle(_request, reply);
  });

  // buscar usuario/prestador logad
  app.get("/", async (request, reply) => {
    return await getUserById.handle(request, reply);
  });

  // atualizar usuario/prestador logado
  app.put<{ Body: IUserUpdateRequestDTO }>("/", async (request, reply) => {
    return updateUser.handle(request, reply);
  });

  // deletar usuario/prestador logado
  app.delete("/", async (request, reply) => {
    return await deleteUser.handle(request, reply);
  });
}
