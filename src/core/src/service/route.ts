import { FastifyInstance } from "fastify";
import {
  IServiceAddRequestDTO,
  IServiceUpdateRequestDTO,
} from "./dto/serviceDTO";
import { PostgresServicesRepository } from "./repositories/PostgresServicesRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUsersRepository";
import { ServiceAddUseCase } from "./useCases/serviceAddUseCase";
import { ServiceAddController } from "./controller/serviceAddController";
import { ServiceDeleteUseCase } from "./useCases/serviceDeleteUseCase";
import { ServiceDeleteController } from "./controller/serviceDeleteController";
import { ServiceGetAllUseCase } from "./useCases/serviceGetAllUseCase";
import { ServiceGetAllController } from "./controller/serviceGetAllController";
import { ServiceGetByIdUseCase } from "./useCases/serviceGetByIdUseCase";
import { ServiceGetByIdController } from "./controller/serviceGetByIdController";
import { ServiceGetAllByUserIdUseCase } from "./useCases/serviceGetAllByUserIdUseCase";
import { ServiceGetAllByUserIdController } from "./controller/serviceGetAllByUserIdController";
import { ServiceUpdateUseCase } from "./useCases/serviceUpdateUseCase";
import { ServiceUpdateController } from "./controller/serviceUpdateController";

// rota publica para buscar todos os serviços de um usuário/prestador
export async function userServiceRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const servicesRepository = new PostgresServicesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const serviceGetAllByUserIdUseCase = new ServiceGetAllByUserIdUseCase(
    servicesRepository,
    usersRepository,
  );

  // Instanciar os Controllers com os UseCases
  const getByUserIdServices = new ServiceGetAllByUserIdController(
    serviceGetAllByUserIdUseCase,
  );

  // execução da rota
  app.get("/:userId/services", async (request, reply) => {
    return await getByUserIdServices.handle(request, reply);
  });
}

// rotas privadas para o prestador logado gerenciar seus serviços
export async function serviceRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const servicesRepository = new PostgresServicesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const serviceAddUseCase = new ServiceAddUseCase(
    servicesRepository,
    usersRepository,
  );
  const serviceUpdateUseCase = new ServiceUpdateUseCase(servicesRepository);
  const serviceDeleteUseCase = new ServiceDeleteUseCase(servicesRepository);
  const serviceGetByIdUseCase = new ServiceGetByIdUseCase(servicesRepository);
  const serviceGetAllUseCase = new ServiceGetAllUseCase(servicesRepository);

  // Instanciar os Controllers com os UseCases
  const addService = new ServiceAddController(serviceAddUseCase);
  const updateService = new ServiceUpdateController(serviceUpdateUseCase);
  const deleteService = new ServiceDeleteController(serviceDeleteUseCase);
  const getByServiceId = new ServiceGetByIdController(serviceGetByIdUseCase);
  const getAllServices = new ServiceGetAllController(serviceGetAllUseCase);

  // add serviço
  app.post<{ Body: IServiceAddRequestDTO }>("/", async (request, reply) => {
    return addService.handle(request, reply);
  });

  // atualizar serviço
  app.put<{ Body: IServiceUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return await updateService.handle(request, reply);
    },
  );

  // excluir serviço
  app.delete("/:id", async (request, reply) => {
    return await deleteService.handle(request, reply);
  });

  // buscar por ID de serviço
  app.get("/:id", async (request, reply) => {
    return await getByServiceId.handle(request, reply);
  });

  // listar todos serviços
  app.get("/", async (_request, reply) => {
    return await getAllServices.handle(_request, reply);
  });
}
