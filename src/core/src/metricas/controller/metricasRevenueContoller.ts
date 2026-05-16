import { FastifyRequest, FastifyReply } from "fastify";
import { requireAuth } from "@/lib/auth";
import { MetricasRevenueUseCase } from "../useCase/metricasRevenueUseCase";
import { RevenueQuery, revenueQuerySchema } from "../schema";
import { parseWith } from "@/lib/validate";

export class MetricasRevenueController {
  constructor(private metricasRevenueUseCase: MetricasRevenueUseCase) {}

  async handle(
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<FastifyReply> {
    const auth = await requireAuth(request);

    const parsed = parseWith(revenueQuerySchema, request.query);
    if (!parsed.success) throw parsed.error;

    try {
      console.log("Received query:", parsed.data);

      const revenue = await this.metricasRevenueUseCase.execute(
        auth,
        parsed.data,
      );

      return response.status(200).send(revenue);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      return response.status(400).send({
        message,
      });
    }
  }
}
