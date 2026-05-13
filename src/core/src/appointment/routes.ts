import { FastifyInstance } from "fastify";
import { PostgresAppointmentsRepository } from "./repositories/PostgresAppointmensRepository";
import { PostgresUsersRepository } from "../user/repositories/PostgresUsersRepository";
import {
  IAppointmentAddRequestDTO,
  IAppointmentUpdateRequestDTO,
} from "./dto/appointmentDTO";

export async function scheduleRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const appointmentsRepository = new PostgresAppointmentsRepository();
  const usersRepository = new PostgresUsersRepository();

  // Instanciar os UseCases com as dependências

  // Instanciar os Controllers com os UseCases

  // add agendamento, para o serviço de um usuário/prestador
  app.post<{ Body: IAppointmentAddRequestDTO }>("/", async (request, reply) => {
    return;
  });

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

  // listar todos os agendamentos de um usuario/prestador
  app.get("/:userId/appointments", async (request, reply) => {
    return;
  });
}
