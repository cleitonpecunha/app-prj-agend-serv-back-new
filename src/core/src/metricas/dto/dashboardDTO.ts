export interface DashboardDTO {
  referenceMonth: string;
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  attendanceRate: number | null;
  scheduledRevenue: number;
  completedRevenue: number;
  nextAppointments: {
    id: string;
    appointmentDate: string;
  };
}
