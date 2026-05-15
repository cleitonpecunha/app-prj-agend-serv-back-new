import { FastifyInstance } from "fastify";
import { PostgresAppointmentsRepository } from "./repositories/PostgresAppointmensRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUsersRepository";
import {
  IAppointmentAddRequestDTO,
  IAppointmentUpdateRequestDTO,
} from "./dto/appointmentDTO";
import { AppointmentAddUseCase } from "./useCase/appointmentAddUseCase";
import { AppointmentAddController } from "./controller/appointmentAddController";
import { PostgresServicesRepository } from "../service/repositories/PostgresServicesRepository";
import { PostgresSchedulesRepository } from "../schedule/repositories/PostgresSchedulesRepository";
import { AppointmentGetAllUserIdUseCase } from "./useCase/appointmentGetAllUserIdUseCase";
import { AppointmentGetAllUserIdController } from "./controller/appointmentGetAllUserIdController";
import { AppointmentDeleteUseCase } from "./useCase/appointmentDeleteUseCase";
import { AppointmentDeleteController } from "./controller/appointmentDeleteController";
import { AppointmentGetByIdUseCase } from "./useCase/appointmentGetByIdUseCase";
import { AppointmentGetByIdController } from "./controller/appointmentGetByIdController";
import { AppointmentUpdateStatusUseCase } from "./useCase/appointmentUpdateStatusUseCase";
import { AppointmentUpdateStatusController } from "./controller/appointmentUpdateStatusController";

// rota para criar agendamento, para o serviço de um usuário/prestador, solictado pelo cliente
export async function serviceAppointmentRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const appointmentsRepository = new PostgresAppointmentsRepository();
  const servicesRepository = new PostgresServicesRepository();
  const schedulesRepository = new PostgresSchedulesRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências
  const appointmentAddUseCase = new AppointmentAddUseCase(
    appointmentsRepository,
    servicesRepository,
    schedulesRepository,
    usersRepository,
  );

  // Instanciar os Controllers com os UseCases
  const appointmentAddController = new AppointmentAddController(
    appointmentAddUseCase,
  );

  // executar a rota
  app.post<{ Body: IAppointmentAddRequestDTO }>(
    "/:serviceId/appointments",
    async (request, reply) => {
      return appointmentAddController.handle(request, reply);
    },
  );
}

// rota para buscar agendamentos de serviços do usuário/prestador, solicitado pelo cliente
export async function userAppointmentRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const appointmentsRepository = new PostgresAppointmentsRepository();

  // Instanciar os UseCases com as dependências
  const appointmentGetAllUserIdUseCase = new AppointmentGetAllUserIdUseCase(
    appointmentsRepository,
  );

  // Instanciar os Controllers com os UseCases
  const appointmentGetAllUserIdController =
    new AppointmentGetAllUserIdController(appointmentGetAllUserIdUseCase);

  // executar a rota
  app.get("/appointments", async (request, reply) => {
    return appointmentGetAllUserIdController.handle(request, reply);
  });
}

// rotas diversas para atualizar, excluir e buscar um agendamento específico, para o serviço de um usuário/prestador, solicitado pelo cliente
export async function appointmentRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const appointmentsRepository = new PostgresAppointmentsRepository();

  // Instanciar os UseCases com as dependências
  const appointmentUpdateStatusUseCase = new AppointmentUpdateStatusUseCase(
    appointmentsRepository,
  );
  const appointmentDeleteUseCase = new AppointmentDeleteUseCase(
    appointmentsRepository,
  );
  const appointmentGetByIdUseCase = new AppointmentGetByIdUseCase(
    appointmentsRepository,
  );

  // Instanciar os Controllers com os UseCases
  const appointmentUpdateStatusController =
    new AppointmentUpdateStatusController(appointmentUpdateStatusUseCase);
  const appointmentDeleteController = new AppointmentDeleteController(
    appointmentDeleteUseCase,
  );
  const appointmentGetByIdController = new AppointmentGetByIdController(
    appointmentGetByIdUseCase,
  );

  // atualizar o status do agendamento, para o serviço de um usuário/prestador
  app.patch<{ Body: IAppointmentUpdateRequestDTO }>(
    "/:id/status",
    async (request, reply) => {
      return appointmentUpdateStatusController.handle(request, reply);
    },
  );

  // excluir agendamento, para o serviço de um usuário/prestador
  app.delete("/:id", async (request, reply) => {
    return appointmentDeleteController.handle(request, reply);
  });

  // buscar agendamento, para o serviço de um usuário/prestador
  app.get("/:id", async (request, reply) => {
    return appointmentGetByIdController.handle(request, reply);
  });
}
