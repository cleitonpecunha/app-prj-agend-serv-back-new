import type { FastifyInstance } from "fastify";
import { assertProviderOwnership, requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import { providerRepository } from "../providers/repository";
import { scheduleRepository } from "./repository";
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleParamsSchema,
  providerSchedulesParamsSchema,
} from "./schemas";
import {
  createSchedule,
  listSchedulesByProvider,
  updateSchedule,
  deleteSchedule,
} from "./schedules";

export async function providerScheduleRoutes(app: FastifyInstance) {
  app.post("/:providerId/schedules", async (request, reply) => {
    const auth = await requireAuth(request);

    const paramsParsed = parseWith(
      providerSchedulesParamsSchema,
      request.params,
    );
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(createScheduleSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const existingProvider = await providerRepository.findById(
      paramsParsed.data.providerId,
    );

    if (!existingProvider) {
      throw new NotFoundError("Prestador");
    }

    assertProviderOwnership(auth.providerId, existingProvider.id);

    const schedule = await createSchedule(
      paramsParsed.data.providerId,
      bodyParsed.data,
    );
    return reply.status(201).send(schedule);
  });

  app.get("/:providerId/schedules", async (request, reply) => {
    const parsed = parseWith(providerSchedulesParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const schedules = await listSchedulesByProvider(parsed.data.providerId);
    return reply.send(schedules);
  });
}

export async function scheduleRoutes(app: FastifyInstance) {
  app.put("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const paramsParsed = parseWith(scheduleParamsSchema, request.params);
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(updateScheduleSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const existingSchedule = await scheduleRepository.findById(
      paramsParsed.data.id,
    );

    if (!existingSchedule) {
      throw new NotFoundError("Horário");
    }

    assertProviderOwnership(auth.providerId, existingSchedule.providerId);

    const schedule = await updateSchedule(
      paramsParsed.data.id,
      bodyParsed.data,
    );
    return reply.send(schedule);
  });

  app.delete("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(scheduleParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const existingSchedule = await scheduleRepository.findById(parsed.data.id);

    if (!existingSchedule) {
      throw new NotFoundError("Horário");
    }

    assertProviderOwnership(auth.providerId, existingSchedule.providerId);

    await deleteSchedule(parsed.data.id);
    return reply.status(204).send();
  });
}
