import { FastifyInstance } from "fastify";
import {
  IScheduleAddRequestDTO,
  IScheduleUpdateRequestDTO,
} from "./dto/scheduleDTO";

export async function scheduleRoutes(app: FastifyInstance) {
  // Instanciar as dependências

  // Instanciar os UseCases com as dependências

  // Instanciar os Controllers com os UseCases

  // add
  app.post<{ Body: IScheduleAddRequestDTO }>("/", async (request, reply) => {
    return;
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
  app.put<{ Body: IScheduleUpdateRequestDTO }>(
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
