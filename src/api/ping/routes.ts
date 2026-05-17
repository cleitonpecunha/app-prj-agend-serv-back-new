import type { FastifyInstance } from "fastify";
import { ping } from "./ping";

export async function pingRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const response = await ping();
    return reply.send(response);
  });
}
