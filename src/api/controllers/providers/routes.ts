import type { FastifyInstance } from "fastify";
import { assertProviderOwnership, requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import { providerRepository } from "./repository";
import {
  createProviderSchema,
  updateProviderSchema,
  providerParamsSchema,
  revenueQuerySchema,
  dashboardQuerySchema,
} from "./schemas";
import {
  createProvider,
  getProviderById,
  updateProvider,
  deleteProvider,
} from "./providers";
import { getProviderRevenue } from "./revenue";
import { getProviderDashboard } from "./dashboard";

export async function providerRoutes(app: FastifyInstance) {
  app.get("/revenue", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(revenueQuerySchema, request.query);
    if (!parsed.success) throw parsed.error;

    const revenue = await getProviderRevenue(auth.providerId, parsed.data);
    return reply.send(revenue);
  });

  app.get("/dashboard", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(dashboardQuerySchema, request.query);
    if (!parsed.success) throw parsed.error;

    const dashboard = await getProviderDashboard(
      auth.providerId,
      parsed.data.month,
    );
    return reply.send(dashboard);
  });

  app.post("/", async (request, reply) => {
    const parsed = parseWith(createProviderSchema, request.body);
    if (!parsed.success) throw parsed.error;

    const provider = await createProvider(parsed.data);
    return reply.status(201).send(provider);
  });

  app.get("/:id", async (request, reply) => {
    const parsed = parseWith(providerParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const provider = await getProviderById(parsed.data.id);
    return reply.send(provider);
  });

  app.put("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const paramsParsed = parseWith(providerParamsSchema, request.params);
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(updateProviderSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const existingProvider = await providerRepository.findById(
      paramsParsed.data.id,
    );

    if (!existingProvider) {
      throw new NotFoundError("Prestador");
    }

    assertProviderOwnership(auth.providerId, existingProvider.id);

    const provider = await updateProvider(
      paramsParsed.data.id,
      bodyParsed.data,
    );
    return reply.send(provider);
  });

  app.delete("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(providerParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const existingProvider = await providerRepository.findById(parsed.data.id);

    if (!existingProvider) {
      throw new NotFoundError("Prestador");
    }

    assertProviderOwnership(auth.providerId, existingProvider.id);

    await deleteProvider(parsed.data.id);
    return reply.status(204).send();
  });
}
