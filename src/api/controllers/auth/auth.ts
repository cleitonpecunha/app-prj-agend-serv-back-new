import { UnauthorizedError } from "@/lib/errors";
import { verifyPassword } from "@/lib/password";
import { providerRepository } from "../providers/repository";
import { toProviderResponse } from "../providers/providers";
import type { LoginInput } from "./schemas";

export async function authenticateProvider(input: LoginInput) {
  const provider = await providerRepository.findByEmail(input.email);

  if (!provider) {
    throw new UnauthorizedError("E-mail ou senha inválidos.");
  }

  const isPasswordValid = await verifyPassword(
    input.password,
    provider.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("E-mail ou senha inválidos.");
  }

  return provider;
}

export async function getProviderSession(providerId: number) {
  const provider = await providerRepository.findById(providerId);

  if (!provider) {
    throw new UnauthorizedError("Sessão inválida.");
  }

  return provider;
}

export function toAuthResponse(
  accessToken: string,
  refreshToken: string,
  provider: Awaited<ReturnType<typeof authenticateProvider>>,
) {
  return {
    accessToken,
    refreshToken,
    provider: toProviderResponse(provider),
  };
}
