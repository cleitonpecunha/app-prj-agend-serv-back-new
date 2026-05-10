import { ConflictError, NotFoundError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { generateSlug } from "@/lib/slug";
import { providerRepository } from "./repository";
import type { CreateProviderInput, UpdateProviderInput } from "./schemas";

type ProviderRow = NonNullable<
  Awaited<ReturnType<typeof providerRepository.findById>>
>;

export function toProviderResponse(provider: ProviderRow) {
  const { passwordHash: _passwordHash, ...publicProvider } = provider;
  return publicProvider;
}

export async function createProvider(input: CreateProviderInput) {
  const slug = generateSlug(input.businessName);

  const [existingEmail, existingSlug] = await Promise.all([
    providerRepository.findByEmail(input.email),
    providerRepository.findBySlug(slug),
  ]);

  if (existingEmail) {
    throw new ConflictError("Já existe um prestador com este e-mail.");
  }

  if (existingSlug) {
    throw new ConflictError("Já existe um prestador com este nome de negócio.");
  }

  const passwordHash = await hashPassword(input.password);

  const provider = await providerRepository.create({
    name: input.name,
    businessName: input.businessName,
    slug,
    email: input.email,
    passwordHash,
    phone: input.phone,
    address: input.address,
  });

  return toProviderResponse(provider);
}

export async function getProviderById(id: number) {
  const provider = await providerRepository.findById(id);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  return toProviderResponse(provider);
}

export async function updateProvider(id: number, input: UpdateProviderInput) {
  const existing = await providerRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Prestador");
  }

  const slug = generateSlug(input.businessName);

  const [conflictEmail, conflictSlug] = await Promise.all([
    providerRepository.findByEmail(input.email),
    providerRepository.findBySlug(slug),
  ]);

  if (conflictEmail && conflictEmail.id !== id) {
    throw new ConflictError("Já existe um prestador com este e-mail.");
  }

  if (conflictSlug && conflictSlug.id !== id) {
    throw new ConflictError("Já existe um prestador com este nome de negócio.");
  }

  const provider = await providerRepository.update(id, { ...input, slug });
  return toProviderResponse(provider);
}

export async function deleteProvider(id: number) {
  const existing = await providerRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Prestador");
  }

  await providerRepository.delete(id);
}
