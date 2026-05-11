import type { FastifyInstance } from "fastify";
import { pingRoutes } from "./controllers/ping/routes";
/* import {
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
import { serviceRoutes } from "@/core/src/service/route";
import { scheduleRoutes } from "@/core/src/schedule/routes";

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
  app.register(userRoutes, { prefix: "/users" });
  app.register(authRoutes, { prefix: "/auth" });
  app.register(serviceRoutes, { prefix: "/services" });
  app.register(scheduleRoutes, { prefix: "/schedules" });
}
