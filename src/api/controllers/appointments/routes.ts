import type { FastifyInstance } from "fastify";
import { assertProviderOwnership, requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import { providerRepository } from "../providers/repository";
import { appointmentRepository } from "./repository";
import {
  appointmentParamsSchema,
  createAppointmentSchema,
  providerAppointmentsParamsSchema,
  serviceAppointmentsParamsSchema,
  updateAppointmentStatusSchema,
} from "./schemas";
import {
  createAppointment,
  getAppointmentById,
  listAppointmentsByProvider,
  updateAppointmentStatus,
} from "./appointments";

export async function serviceAppointmentRoutes(app: FastifyInstance) {
  app.post("/:serviceId/appointments", async (request, reply) => {
    const paramsParsed = parseWith(
      serviceAppointmentsParamsSchema,
      request.params,
    );
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(createAppointmentSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const appointment = await createAppointment(
      paramsParsed.data.serviceId,
      bodyParsed.data,
    );
    return reply.status(201).send(appointment);
  });
}

export async function providerAppointmentRoutes(app: FastifyInstance) {
  app.get("/:providerId/appointments", async (request, reply) => {
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
  });
}

export async function appointmentRoutes(app: FastifyInstance) {
  app.get("/:id", async (request, reply) => {
    const auth = await requireAuth(request);

    const parsed = parseWith(appointmentParamsSchema, request.params);
    if (!parsed.success) throw parsed.error;

    const existingAppointment = await appointmentRepository.findById(
      parsed.data.id,
    );

    if (!existingAppointment) {
      throw new NotFoundError("Agendamento");
    }

    assertProviderOwnership(auth.providerId, existingAppointment.providerId);

    const appointment = await getAppointmentById(parsed.data.id);
    return reply.send(appointment);
  });

  app.patch("/:id/status", async (request, reply) => {
    const auth = await requireAuth(request);

    const paramsParsed = parseWith(appointmentParamsSchema, request.params);
    if (!paramsParsed.success) throw paramsParsed.error;

    const bodyParsed = parseWith(updateAppointmentStatusSchema, request.body);
    if (!bodyParsed.success) throw bodyParsed.error;

    const existingAppointment = await appointmentRepository.findById(
      paramsParsed.data.id,
    );

    if (!existingAppointment) {
      throw new NotFoundError("Agendamento");
    }

    assertProviderOwnership(auth.providerId, existingAppointment.providerId);

    const appointment = await updateAppointmentStatus(
      paramsParsed.data.id,
      bodyParsed.data,
    );
    return reply.send(appointment);
  });
}
