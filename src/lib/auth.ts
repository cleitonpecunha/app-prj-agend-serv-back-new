import type { FastifyRequest } from "fastify";
import {
  ForbiddenError,
  TokenExpiredError,
  UnauthorizedError,
} from "@/lib/errors";
import { IAuthenticatedUserPayload } from "@/core/src/auth/dto/authDTO";

export async function requireAuth(request: FastifyRequest) {
  try {
    const payload = await request.jwtVerify<IAuthenticatedUserPayload>();

    console.log("Payload do token:", payload);

    // Verificar se o token é do tipo "access"
    if (payload.tokenType && payload.tokenType !== "access") {
      throw new UnauthorizedError();
    }

    // Validar se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new TokenExpiredError();
    }

    const userId = payload.id;

    //console.log("userId:", payload.id);

    //if (!Number.isInteger(providerId) || providerId <= 0) {
    //  throw new UnauthorizedError();
    //}

    if (!userId) {
      throw new UnauthorizedError();
    }

    //console.log("Payload do token:", payload);

    return {
      ...payload,
      userId,
    };
  } catch {
    throw new UnauthorizedError();
  }
}

export function assertProviderOwnership(
  authenticatedUserId: string,
  resourceUserId: string,
) {
  if (authenticatedUserId !== resourceUserId) {
    throw new ForbiddenError();
  }
}
