export interface IAppointmentAddRequestDTO {
  id: string;
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
}

export interface IAppointmentUpdateRequestDTO {
  status: "completed" | "canceled" | "no_show";
}

export interface IAppointmentResponseDTO {
  id: string;
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
}
