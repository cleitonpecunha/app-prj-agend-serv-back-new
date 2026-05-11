import { FastifyInstance } from "fastify";
import {
  IServiceAddRequestDTO,
  IServiceUpdateRequestDTO,
} from "./dto/serviceDTO";
import { addServiceSchema } from "./schemas";
import { parseWith } from "@/lib/validate";
import { PostgresServicesRepository } from "./repositories/PostgresServicesRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUserRepository";
import { ServiceAddUseCase } from "./useCases/serviceAddUseCase";
import { ServiceAddController } from "./controller/serviceAddController";

export async function serviceRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const servicesRepository = new PostgresServicesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const serviceAddUseCase = new ServiceAddUseCase(
    servicesRepository,
    usersRepository,
  );

  // Instanciar os Controllers com os UseCases
  const registerService = new ServiceAddController(serviceAddUseCase);

  // add
  app.post<{ Body: IServiceAddRequestDTO }>("/", async (request, reply) => {
    const parsed = parseWith(addServiceSchema, request.body);
    if (!parsed.success) throw parsed.error;

    return registerService.handle(request, reply);
  });

  // listar todos
  app.get("/", async (_request, reply) => {
    return;
  });

  // buscar por ID
  app.get("/:id", async (request, reply) => {
    return;
  });

  // atualizar
  app.put<{ Body: IServiceUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return;
    },
  );

  // excluir
  app.delete("/:id", async (request, reply) => {
    return;
  });
}
