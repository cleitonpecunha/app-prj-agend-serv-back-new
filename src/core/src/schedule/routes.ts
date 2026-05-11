import { FastifyInstance } from "fastify";

interface addSchedule {
  userId: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

interface updateSchedule {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export async function scheduleRoutes(app: FastifyInstance) {
  // Instanciar as dependências

  // Instanciar os UseCases com as dependências

  // Instanciar os Controllers com os UseCases

  // add
  app.post<{ Body: addSchedule }>("/", async (request, reply) => {
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
  app.put<{ Body: updateSchedule }>("/:id", async (request, reply) => {
    return;
  });

  // excluir
  app.delete("/:id", async (request, reply) => {
    return;
  });
}
