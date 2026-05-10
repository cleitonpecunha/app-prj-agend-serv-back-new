import { sendMail } from "@/lib/mail";
import { buildAppointmentConfirmationEmail } from "@/lib/email-templates/appointment-confirmation";
import { buildProviderAppointmentNotificationEmail } from "@/lib/email-templates/provider-appointment-notification";

export interface AppointmentNotificationPayload {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  notes?: string | null;
  providerName: string;
  providerEmail: string;
  providerBusinessName: string;
}

export async function sendAppointmentConfirmationToClient(
  payload: AppointmentNotificationPayload,
): Promise<void> {
  const email = buildAppointmentConfirmationEmail({
    clientName: payload.clientName,
    serviceName: payload.serviceName,
    providerBusinessName: payload.providerBusinessName,
    appointmentDate: payload.appointmentDate,
    startTime: payload.startTime,
  });
  await sendMail({ to: payload.clientEmail, ...email });
}

export async function sendNewAppointmentNotificationToProvider(
  payload: AppointmentNotificationPayload,
): Promise<void> {
  const email = buildProviderAppointmentNotificationEmail({
    providerName: payload.providerName,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail,
    clientPhone: payload.clientPhone,
    serviceName: payload.serviceName,
    appointmentDate: payload.appointmentDate,
    startTime: payload.startTime,
    notes: payload.notes ?? null,
  });
  await sendMail({ to: payload.providerEmail, ...email });
}
