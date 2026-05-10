import type { FastifyInstance } from "fastify";
import { assertProviderOwnership, requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import { serviceRepository } from "./repository";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceParamsSchema,
  providerServicesParamsSchema,
} from "./schemas";
import {
  createService,
  listServices,
  listServicesByProvider,
  getServiceById,
  updateService,
  deleteService,
} from "./services";

export async function serviceRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(createServiceSchema, request.body);
    if (!parsed.success) throw parsed.error;

    assertProviderOwnership(auth.providerId, parsed.data.providerId);

    const service = await createService(parsed.data);
    return reply.status(201).send(service);
  });

  app.get("/", async (_request, reply) => {
    const services = await listServices();
    return reply.send(services);
  });

  app.get("/:id", async (request, reply) => {
    const parsed = parseWith(serviceParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const service = await getServiceById(parsed.data.id);
    return reply.send(service);
  });

  app.put("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const paramsParsed = parseWith(serviceParamsSchema, request.params);
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(updateServiceSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const existingService = await serviceRepository.findById(
      paramsParsed.data.id,
    );

    if (!existingService) {
      throw new NotFoundError("Serviço");
    }

    assertProviderOwnership(auth.providerId, existingService.providerId);

    const service = await updateService(paramsParsed.data.id, bodyParsed.data);
    return reply.send(service);
  });

  app.delete("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(serviceParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const existingService = await serviceRepository.findById(parsed.data.id);

    if (!existingService) {
      throw new NotFoundError("Serviço");
    }

    assertProviderOwnership(auth.providerId, existingService.providerId);

    await deleteService(parsed.data.id);
    return reply.status(204).send();
  });
}

export async function providerServiceRoutes(app: FastifyInstance) {
  app.get("/:providerId/services", async (request, reply) => {
    const parsed = parseWith(providerServicesParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const services = await listServicesByProvider(parsed.data.providerId);
    return reply.send(services);
  });
}
