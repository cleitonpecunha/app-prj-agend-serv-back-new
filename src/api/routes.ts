import type { FastifyInstance } from "fastify";
import { pingRoutes } from "./controllers/ping/routes";

/* 
import {
  appointmentRoutes,
  providerAppointmentRoutes,
  serviceAppointmentRoutes,
} from "./controllers/appointments/routes";

import { authRoutes } from "./controllers/auth/routes";

import { providerRoutes } from "./controllers/providers/routes";

import {
  serviceRoutes,
  providerServiceRoutes,
} from "./controllers/services/routes";

import {
  scheduleRoutes,
  providerScheduleRoutes,
} from "./controllers/schedules/routes"; */

import { userRoutes } from "@/core/src/user/routes";
import { authRoutes } from "@/core/src/auth/routes";
import { serviceRoutes, userServiceRoutes } from "@/core/src/service/route";
import { scheduleRoutes, userScheduleRoutes } from "@/core/src/schedule/routes";
import {
  appointmentRoutes,
  serviceAppointmentRoutes,
} from "@/core/src/appointment/routes";
import { metricasRoutes } from "@/core/src/dashboard/route";

export async function apiRoutes(app: FastifyInstance) {
  /* app.register(authRoutes, { prefix: "/auth" });
  
  app.register(providerRoutes, { prefix: "/providers" });
  
  app.register(providerAppointmentRoutes, { prefix: "/providers" });
  app.register(providerServiceRoutes, { prefix: "/providers" });
  app.register(providerScheduleRoutes, { prefix: "/providers" });
  
  app.register(serviceAppointmentRoutes, { prefix: "/services" });
  
  app.register(serviceRoutes, { prefix: "/services" });
  
  app.register(appointmentRoutes, { prefix: "/appointments" });
  
  app.register(scheduleRoutes, { prefix: "/schedules" }); */

  app.register(pingRoutes, { prefix: "/ping" });

  // rotas de usuários/prestadores
  app.register(userRoutes, { prefix: "/users" });

  // rotas de autenticação
  app.register(authRoutes, { prefix: "/auth" });

  // rotas de serviços de atendimentos do usurio/prestador
  app.register(serviceRoutes, { prefix: "/services" });
  app.register(userServiceRoutes, { prefix: "/users" });

  // rotas de agenda de atendimentos do usurio/prestador
  app.register(scheduleRoutes, { prefix: "/schedules" });
  app.register(userScheduleRoutes, { prefix: "/users" });

  // rotas de agendamento
  app.register(appointmentRoutes, { prefix: "/appointments" });
  app.register(serviceAppointmentRoutes, { prefix: "/services" });
  /*app.register(userAppointmentRoutes, { prefix: "/users" });*/

  // rota de metricas
  app.register(metricasRoutes, { prefix: "/users" });
}
