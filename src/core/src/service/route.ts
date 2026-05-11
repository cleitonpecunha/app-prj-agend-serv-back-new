import { FastifyInstance } from "fastify";
import {
  IServiceAddRequestDTO,
  IServiceUpdateRequestDTO,
} from "./dto/serviceDTO";

export async function serviceRoutes(app: FastifyInstance) {
  // Instanciar as dependências

  // Instanciar os UseCases com as dependências

  // Instanciar os Controllers com os UseCases

  // add
  app.post<{ Body: IServiceAddRequestDTO }>("/", async (request, reply) => {
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
