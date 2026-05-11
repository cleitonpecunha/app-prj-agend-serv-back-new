import { FastifyInstance } from "fastify";

interface addService {
  userId: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  priceInCents?: number;
  isActive?: boolean;
}

interface updateService {
  name?: string;
  description?: string;
  durationMinutes?: number;
  priceInCents?: number;
  isActive?: boolean;
}

export async function serviceRoutes(app: FastifyInstance) {
  // Instanciar as dependências

  // Instanciar os UseCases com as dependências

  // Instanciar os Controllers com os UseCases

  // add
  app.post<{ Body: addService }>("/", async (request, reply) => {
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
  app.put<{ Body: updateService }>("/:id", async (request, reply) => {
    return;
  });

  // excluir
  app.delete("/:id", async (request, reply) => {
    return;
  });
}
