import { FastifyInstance } from "fastify";
import {
  IScheduleAddRequestDTO,
  IScheduleUpdateRequestDTO,
} from "./dto/scheduleDTO";
import { PostgresSchedulesRepository } from "./repositories/PostgresSchedulesRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUsersRepository";
import { ScheduleAddUseCase } from "./useCase/scheduleAddUseCase";
import { ScheduleDeleteUseCase } from "./useCase/scheduleDeleteUseCase";
import { ScheduleGetByUserIdUseCase } from "./useCase/scheduleGetByUserIdUseCase";
import { ScheduleUpdateUseCase } from "./useCase/scheduleUpdateUseCase";
import { ScheduleAddController } from "./controller/scheduleAddController";
import { ScheduleUpdateController } from "./controller/scheduleUpdateController";
import { ScheduleDeleteController } from "./controller/scheduleDEleteController";
import { ScheduleGetByUserIdController } from "./controller/scheduleGetByUserIdController";

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
  const scheduleGetByUserIdUseCase = new ScheduleGetByUserIdUseCase(
    schedulesRepository,
    usersRepository,
  );

  // Instanciar os Controllers com os UseCases
  const addSchedule = new ScheduleAddController(scheduleAddUseCase);
  const updateSchedule = new ScheduleUpdateController(scheduleUpdateUseCase);
  const deleteSchedule = new ScheduleDeleteController(scheduleDeleteUseCase);
  const getByUserIdSchedule = new ScheduleGetByUserIdController(
    scheduleGetByUserIdUseCase,
  );

  // add horario de atendimento do prestador logado
  app.post<{ Body: IScheduleAddRequestDTO }>("/", async (request, reply) => {
    return addSchedule.handle(request, reply);
  });

  // atualizar horario de atendimento do prestador logado
  app.put<{ Body: IScheduleUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return await updateSchedule.handle(request, reply);
    },
  );

  // excluir horario de atendimento do prestador logado
  app.delete("/:id", async (request, reply) => {
    return await deleteSchedule.handle(request, reply);
  });

  // listar todos os horarios de atendimento de um usuario/prestador
  app.get("/:userId/schedules", async (request, reply) => {
    return await getByUserIdSchedule.handle(request, reply);
  });
}
