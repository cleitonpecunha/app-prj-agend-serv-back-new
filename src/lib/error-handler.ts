import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { env } from "@/config/env";

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: "Validation Error",
      message: "Os dados enviados são inválidos.",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
  }

  reply.log.error(error);

  const isProduction = env.NODE_ENV === "production";

  return reply.status(500).send({
    error: "Internal Server Error",
    message: isProduction
      ? "Ocorreu um erro interno. Tente novamente mais tarde."
      : error.message,
  });
}
