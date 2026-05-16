import { FastifyInstance } from "fastify";
import { PostgresAppointmentsRepository } from "../appointment/repositories/PostgresAppointmensRepository";
import { MetricasDashBoardUseCase } from "./useCase/metricasDashBoardUseCase";
import { MetricasDashboardController } from "./controller/metricasDashBoardController";
import { MetricasRevenueUseCase } from "./useCase/metricasRevenueUseCase";
import { MetricasRevenueController } from "./controller/metricasRevenueContoller";

// rotas privadas
export async function metricasRoutes(app: FastifyInstance) {
  // Instanciar as dependências
  const appointmentsRepository = new PostgresAppointmentsRepository();

  // Instanciar os UseCases com as dependências
  const metricasDashboardUseCase = new MetricasDashBoardUseCase(
    appointmentsRepository,
  );
  const metricasRevenueUseCase = new MetricasRevenueUseCase(
    appointmentsRepository,
  );

  // Instanciar os Controllers com os UseCases
  const metricasDashBoard = new MetricasDashboardController(
    metricasDashboardUseCase,
  );
  const metricasRevenue = new MetricasRevenueController(metricasRevenueUseCase);

  // rotas do dashboard
  app.get("/revenue", async (request, reply) => {
    return metricasRevenue.handle(request, reply);
  });

  // rotas do dashboard
  app.get("/dashboard", async (request, reply) => {
    return metricasDashBoard.handle(request, reply);
  });
}
