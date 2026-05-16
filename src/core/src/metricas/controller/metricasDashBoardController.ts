import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { MetricasDashBoardUseCase } from "../useCase/metricasDashBoardUseCase";
import { parseWith } from "@/lib/validate";
import { dashboardQuerySchema } from "../schema";

export class MetricasDashboardController {
  constructor(private metricasDashboardUseCase: MetricasDashBoardUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const parsed = parseWith(dashboardQuerySchema, request.query);
    if (!parsed.success) throw parsed.error;

    try {
      const dashboard = await this.metricasDashboardUseCase.execute(
        auth,
        parsed.data.month,
      );

      return response.status(200).send(dashboard);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
