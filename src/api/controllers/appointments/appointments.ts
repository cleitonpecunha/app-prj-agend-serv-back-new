import { AppointmentStatus } from "@/generated/prisma/enums";
import {
  sendAppointmentConfirmationToClient,
  sendNewAppointmentNotificationToProvider,
} from "@/lib/appointment-notifications";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { providerRepository } from "../providers/repository";
import { scheduleRepository } from "../schedules/repository";
import { serviceRepository } from "../services/repository";
import { appointmentRepository } from "./repository";
import type {
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "./schemas";

const DAY_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type AppointmentWithService = Awaited<
  ReturnType<typeof appointmentRepository.findByProviderAndDate>
>[number];

type AppointmentRow = NonNullable<
  Awaited<ReturnType<typeof appointmentRepository.findById>>
>;

function toAppointmentDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function getDayOfWeek(date: Date) {
  return DAY_OF_WEEK[date.getUTCDay()];
}

function parseTimeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toDateOnlyString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toAppointmentResponse<T extends AppointmentRow>(appointment: T) {
  return {
    ...appointment,
    appointmentDate: toDateOnlyString(appointment.appointmentDate),
  };
}

function intervalFitsSchedule(
  schedules: Awaited<ReturnType<typeof scheduleRepository.findByProviderId>>,
  appointmentDayOfWeek: string,
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return schedules.some((schedule) => {
    if (schedule.dayOfWeek !== appointmentDayOfWeek) {
      return false;
    }

    const scheduleStartMinutes = parseTimeToMinutes(schedule.startTime);
    const scheduleEndMinutes = parseTimeToMinutes(schedule.endTime);

    return (
      scheduleStartMinutes <= requestedStartMinutes &&
      scheduleEndMinutes >= requestedEndMinutes
    );
  });
}

function hasAppointmentConflict(
  existingAppointments: AppointmentWithService[],
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return existingAppointments.some((appointment) => {
    const existingStartMinutes = parseTimeToMinutes(appointment.startTime);
    const existingEndMinutes =
      existingStartMinutes + appointment.service.durationMinutes;

    return (
      existingStartMinutes < requestedEndMinutes &&
      existingEndMinutes > requestedStartMinutes
    );
  });
}

export async function createAppointment(
  serviceId: number,
  input: CreateAppointmentInput,
) {
  const service = await serviceRepository.findById(serviceId);

  if (!service) {
    throw new NotFoundError("Serviço");
  }

  if (!service.isActive) {
    throw new ConflictError("O serviço informado está inativo.");
  }

  const appointmentDate = toAppointmentDate(input.appointmentDate);
  const appointmentDayOfWeek = getDayOfWeek(appointmentDate);
  const requestedStartMinutes = parseTimeToMinutes(input.startTime);
  const requestedEndMinutes = requestedStartMinutes + service.durationMinutes;

  const schedules = await scheduleRepository.findByProviderId(
    service.providerId,
  );

  if (
    requestedEndMinutes > 24 * 60 ||
    !intervalFitsSchedule(
      schedules,
      appointmentDayOfWeek,
      requestedStartMinutes,
      requestedEndMinutes,
    )
  ) {
    throw new ConflictError(
      "O horário solicitado não está dentro da disponibilidade do prestador.",
    );
  }

  const existingAppointments =
    await appointmentRepository.findByProviderAndDate(
      service.providerId,
      appointmentDate,
    );

  if (
    hasAppointmentConflict(
      existingAppointments,
      requestedStartMinutes,
      requestedEndMinutes,
    )
  ) {
    throw new ConflictError(
      "Já existe um agendamento para o intervalo informado.",
    );
  }

  const provider = await providerRepository.findById(service.providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const appointment = await appointmentRepository.create({
    providerId: service.providerId,
    serviceId,
    appointmentDate,
    startTime: input.startTime,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientPhone: input.clientPhone,
    ...(input.notes ? { notes: input.notes } : {}),
  });

  const notificationPayload = {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientPhone: input.clientPhone,
    serviceName: service.name,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    notes: input.notes ?? null,
    providerName: provider.name,
    providerEmail: provider.email,
    providerBusinessName: provider.businessName,
  };

  await sendAppointmentConfirmationToClient(notificationPayload);
  await sendNewAppointmentNotificationToProvider(notificationPayload);

  return toAppointmentResponse(appointment);
}

export async function listAppointmentsByProvider(providerId: number) {
  const provider = await providerRepository.findById(providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const appointments = await appointmentRepository.findByProviderId(providerId);
  return appointments.map(toAppointmentResponse);
}

export async function getAppointmentById(id: number) {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new NotFoundError("Agendamento");
  }

  return toAppointmentResponse(appointment);
}

export async function updateAppointmentStatus(
  id: number,
  input: UpdateAppointmentStatusInput,
) {
  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw new NotFoundError("Agendamento");
  }

  if (appointment.status !== AppointmentStatus.scheduled) {
    throw new ConflictError(
      "O status do agendamento não pode mais ser alterado.",
    );
  }

  if (input.status === AppointmentStatus.scheduled) {
    throw new AppError("Status inválido para atualização.", 422);
  }

  return appointmentRepository
    .updateStatus(id, input)
    .then(toAppointmentResponse);
}
