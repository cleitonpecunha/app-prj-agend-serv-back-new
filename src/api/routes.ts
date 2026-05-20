import {
  appointmentRoutes,
  serviceAppointmentRoutes,
} from "@/core/src/appointment/routes";
import { authRoutes } from "@/core/src/auth/routes";
import { metricasRoutes } from "@/core/src/metricas/route";
import { pingRoutes } from "./ping/routes";
import { scheduleRoutes, userScheduleRoutes } from "@/core/src/schedule/routes";
import { serviceRoutes, userServiceRoutes } from "@/core/src/service/route";
import { userRoutes } from "@/core/src/user/routes";
import type { FastifyInstance } from "fastify";

export async function apiRoutes(app: FastifyInstance) {
  // rota de teste
  app.register(pingRoutes, { prefix: "/ping" });

  // rotas de usuários/prestadores
  app.register(userRoutes, { prefix: "/users" });

  // rotas de autenticação
  app.register(authRoutes, { prefix: "/auth" });

  // rotas de serviços de atendimentos do usurio/prestador
  app.register(serviceRoutes, { prefix: "/services" });
  app.register(userServiceRoutes, { prefix: "/users" });

  // rotas de horarios de atendimentos do usurio/prestador
  app.register(scheduleRoutes, { prefix: "/schedules" });
  app.register(userScheduleRoutes, { prefix: "/users" });

  // rotas de agendamento
  app.register(appointmentRoutes, { prefix: "/appointments" });
  app.register(serviceAppointmentRoutes, { prefix: "/services" });
  /*app.register(userAppointmentRoutes, { prefix: "/users" });*/

  // rota de metricas
  app.register(metricasRoutes, { prefix: "/users" });
}
