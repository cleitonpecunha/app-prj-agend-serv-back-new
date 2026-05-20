import { FastifyInstance } from "fastify";
import {
  IScheduleAddRequestDTO,
  IScheduleUpdateRequestDTO,
} from "./dto/scheduleDTO";
import { PostgresSchedulesRepository } from "./repositories/PostgresSchedulesRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUsersRepository";
import { ScheduleAddController } from "./controller/scheduleAddController";
import { ScheduleAddUseCase } from "./useCase/scheduleAddUseCase";
import { ScheduleDeleteController } from "./controller/scheduleDeleteController";
import { ScheduleDeleteUseCase } from "./useCase/scheduleDeleteUseCase";
import { ScheduleGetAllByUserIdController } from "./controller/scheduleGetAllByUserIdController";
import { ScheduleGetAllByUserIdUseCase } from "./useCase/scheduleGetAllByUserIdUseCase";
import { ScheduleGetAllController } from "./controller/scheduleGetAllController";
import { ScheduleGetAllUseCase } from "./useCase/scheduleGetAllUseCase";
import { ScheduleGetByIdController } from "./controller/scheduleGetByIdController";
import { ScheduleGetByIdUseCase } from "./useCase/scheduleGetByIdUseCase";
import { ScheduleUpdateController } from "./controller/scheduleUpdateController";
import { ScheduleUpdateUseCase } from "./useCase/scheduleUpdateUseCase";

// rota publica para buscar todos os horarios de atendimento um usuário/prestador
export async function userScheduleRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const schedulesRepository = new PostgresSchedulesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const scheduleGetAllByUserIdUseCase = new ScheduleGetAllByUserIdUseCase(
    schedulesRepository,
    usersRepository,
  );

  // Instanciar os Controllers com os UseCases
  const getAllByUserIdSchedule = new ScheduleGetAllByUserIdController(
    scheduleGetAllByUserIdUseCase,
  );

  // execução da rota
  app.get("/:userId/schedules", async (request, reply) => {
    return await getAllByUserIdSchedule.handle(request, reply);
  });
}

// rotas privadas para o prestador logado gerenciar seus horarios de atendimento
export async function scheduleRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const schedulesRepository = new PostgresSchedulesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const scheduleAddUseCase = new ScheduleAddUseCase(
    schedulesRepository,
    usersRepository,
  );
  const scheduleUpdateUseCase = new ScheduleUpdateUseCase(schedulesRepository);
  const scheduleDeleteUseCase = new ScheduleDeleteUseCase(schedulesRepository);
  const scheduleGetByIdUseCase = new ScheduleGetByIdUseCase(
    schedulesRepository,
  );
  const scheduleGetAllUseCase = new ScheduleGetAllUseCase(schedulesRepository);

  // Instanciar os Controllers com os UseCases
  const addSchedule = new ScheduleAddController(scheduleAddUseCase);
  const updateSchedule = new ScheduleUpdateController(scheduleUpdateUseCase);
  const deleteSchedule = new ScheduleDeleteController(scheduleDeleteUseCase);
  const getByScheduleId = new ScheduleGetByIdController(scheduleGetByIdUseCase);
  const getAllSchedules = new ScheduleGetAllController(scheduleGetAllUseCase);

  // add horario de atendimento
  app.post<{ Body: IScheduleAddRequestDTO }>("/", async (request, reply) => {
    return addSchedule.handle(request, reply);
  });

  // atualizar horario de atendimento
  app.put<{ Body: IScheduleUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return await updateSchedule.handle(request, reply);
    },
  );

  // excluir horario de atendimento
  app.delete("/:id", async (request, reply) => {
    return await deleteSchedule.handle(request, reply);
  });

  // buscar por ID de horario de atendimento
  app.get("/:id", async (request, reply) => {
    return await getByScheduleId.handle(request, reply);
  });

  // listar todos horario de atendimentos
  app.get("/all", async (_request, reply) => {
    return await getAllSchedules.handle(_request, reply);
  });
}
