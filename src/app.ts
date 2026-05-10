import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { env } from "@/config/env";
import { errorHandler } from "@/lib/error-handler";
import { apiRoutes } from "./api/routes";

export const app = fastify({
  logger: {
    level: env.LOG_LEVEL,
  },
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(cors, {
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.setErrorHandler(errorHandler);

app.register(apiRoutes, { prefix: "/api" });
