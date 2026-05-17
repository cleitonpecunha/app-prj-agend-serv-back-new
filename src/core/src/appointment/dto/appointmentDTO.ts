export interface IAppointmentAddRequestDTO {
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
}

export interface IAppointmentUpdateRequestDTO {
  status: "scheduled" | "completed" | "canceled" | "no_show";
}

export interface IAppointmentResponseDTO {
  id: string;
  userId: string;
  serviceId: string;
  status: "scheduled" | "completed" | "canceled" | "no_show";
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
}

export interface IAppointmentServiceResponseDTO {
  id: string;
  userId: string;
  user: { name: string };
  serviceId: string;
  service: {
    name: string;
    durationMinutes: number;
    priceInCents: number;
  };
  status: "scheduled" | "completed" | "canceled" | "no_show";
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
}

export interface IAppointmentMailRegisterConfirmationDTO {
  clientName: string;
  serviceName: string;
  userBusinessName: string;
  appointmentDate: string;
  startTime: string;
}
