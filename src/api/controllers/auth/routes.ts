import type { FastifyInstance } from "fastify";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/lib/errors";
import { parseWith } from "@/lib/validate";
import {
  authenticateProvider,
  getProviderSession,
  toAuthResponse,
} from "./auth";
import { loginSchema, refreshTokenSchema } from "./schemas";

function buildAccessTokenPayload(provider: { id: number; email: string }) {
  return {
    sub: String(provider.id),
    providerId: provider.id,
    email: provider.email,
    tokenType: "access" as const,
  };
}

async function issueTokenPair(
  app: FastifyInstance,
  provider: { id: number; email: string },
) {
  const accessToken = await app.jwt.sign(buildAccessTokenPayload(provider), {
    expiresIn: "15m",
  });

  const refreshToken = await app.jwt.sign(
    {
      sub: String(provider.id),
      providerId: provider.id,
      email: provider.email,
      tokenType: "refresh" as const,
    },
    {
      expiresIn: "7d",
      key: env.JWT_REFRESH_SECRET,
    },
  );

  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const parsed = parseWith(loginSchema, request.body);
    if (!parsed.success) throw parsed.error;

    const provider = await authenticateProvider(parsed.data);
    const tokens = await issueTokenPair(app, provider);

    return reply.send(
      toAuthResponse(tokens.accessToken, tokens.refreshToken, provider),
    );
  });

  app.post("/refresh", async (request, reply) => {
    const parsed = parseWith(refreshTokenSchema, request.body);
    if (!parsed.success) throw parsed.error;

    let payload: {
      sub: string;
      providerId?: number;
      tokenType?: string;
    };

    try {
      payload = await app.jwt.verify(parsed.data.refreshToken, {
        key: env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedError("Sessão inválida.");
    }

    if (payload.tokenType !== "refresh") {
      throw new UnauthorizedError("Sessão inválida.");
    }

    const providerId = Number(payload.providerId ?? payload.sub);
    const provider = await getProviderSession(providerId);
    const tokens = await issueTokenPair(app, provider);

    return reply.send(
      toAuthResponse(tokens.accessToken, tokens.refreshToken, provider),
    );
  });
}
