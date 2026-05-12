import { FastifyInstance } from "fastify";
import {
  IServiceAddRequestDTO,
  IServiceUpdateRequestDTO,
} from "./dto/serviceDTO";
import { PostgresServicesRepository } from "./repositories/PostgresServicesRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUserRepository";
import { ServiceAddUseCase } from "./useCases/serviceAddUseCase";
import { ServiceAddController } from "./controller/serviceAddController";
import { ServiceDeleteUseCase } from "./useCases/serviceDeleteUseCase";
import { ServiceDeleteController } from "./controller/serviceDeleteController";
import { ServiceListUseCase } from "./useCases/serviceListUseCase";
import { ServiceListController } from "./controller/serviceListController";
import { ServiceGetByIdUseCase } from "./useCases/serviceGetByIdUseCase";
import { ServiceGetByIdController } from "./controller/serviceGetByIdController";
import { ServiceGetByUserIdUseCase } from "./useCases/serviceGetByUserIdUseCase";
import { ServiceGetByUserIdController } from "./controller/serviceGetByUserIdController";
import { ServiceUpdateUseCase } from "./useCases/serviceUpdateUseCase";
import { ServiceUpdateController } from "./controller/serviceUpdateController";

export async function serviceRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const servicesRepository = new PostgresServicesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const serviceAddUseCase = new ServiceAddUseCase(
    servicesRepository,
    usersRepository,
  );
  const serviceDeleteUseCase = new ServiceDeleteUseCase(servicesRepository);
  const serviceListUseCase = new ServiceListUseCase(servicesRepository);
  const serviceGetByIdUseCase = new ServiceGetByIdUseCase(servicesRepository);
  const serviceGetByUserIdUseCase = new ServiceGetByUserIdUseCase(
    servicesRepository,
    usersRepository,
  );
  const serviceUpdateUseCase = new ServiceUpdateUseCase(servicesRepository);

  // Instanciar os Controllers com os UseCases
  const registerService = new ServiceAddController(serviceAddUseCase);
  const deleteService = new ServiceDeleteController(serviceDeleteUseCase);
  const listServices = new ServiceListController(serviceListUseCase);
  const getByServiceId = new ServiceGetByIdController(serviceGetByIdUseCase);
  const getByUserIdServices = new ServiceGetByUserIdController(
    serviceGetByUserIdUseCase,
  );
  const updateService = new ServiceUpdateController(serviceUpdateUseCase);

  // add serviço do prestador logado
  app.post<{ Body: IServiceAddRequestDTO }>("/", async (request, reply) => {
    return registerService.handle(request, reply);
  });

  // listar todos serviços do prestador logado
  app.get("/", async (_request, reply) => {
    return await listServices.handle(_request, reply);
  });

  // buscar por ID de serviço do prestador logado
  app.get("/:id", async (request, reply) => {
    return await getByServiceId.handle(request, reply);
  });

  // atualizar serviço do prestador logado
  app.put<{ Body: IServiceUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return await updateService.handle(request, reply);
    },
  );

  // excluir serviço do prestador logado
  app.delete("/:id", async (request, reply) => {
    return await deleteService.handle(request, reply);
  });

  // listar todos os serviços de um usuario/prestador
  app.get("/:userId/services", async (request, reply) => {
    return await getByUserIdServices.handle(request, reply);
  });
}
