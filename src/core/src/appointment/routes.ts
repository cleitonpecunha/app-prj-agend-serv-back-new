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

// criar agendamento, para o serviço de um usuário/prestador, solictado pelo cliente
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

  // add agendamento, para o serviço de um usuário/prestador
  app.post<{ Body: IAppointmentAddRequestDTO }>(
    "/:serviceId/appointments",
    async (request, reply) => {
      return appointmentAddController.handle(request, reply);
    },
  );
}

export async function userAppointmentRoutes(app: FastifyInstance) {
  app.get("/:userId/appointments", async (request, reply) => {
    /*
    const auth = await requireAuth(request);

    const parsed = parseWith(providerAppointmentsParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const existingProvider = await providerRepository.findById(
      parsed.data.providerId,
    );

    if (!existingProvider) {
      throw new NotFoundError("Prestador");
    }

    assertProviderOwnership(auth.providerId, existingProvider.id);

    const appointments = await listAppointmentsByProvider(
      parsed.data.providerId,
    );
    return reply.send(appointments);
    */
    return;
  });
}

export async function appointmentRoutes(app: FastifyInstance) {
  // atualizar o status do agendamento, para o serviço de um usuário/prestador
  app.put<{ Body: IAppointmentUpdateRequestDTO }>(
    "/:id",
    async (request, reply) => {
      return;
    },
  );

  // excluir agendamento, para o serviço de um usuário/prestador
  app.delete("/:id", async (request, reply) => {
    return;
  });

  // buscar agendamento, para o serviço de um usuário/prestador
  app.get("/:id", async (request, reply) => {
    return;
  });
}
