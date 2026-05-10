import { ConflictError, NotFoundError } from "@/lib/errors";
import { providerRepository } from "../providers/repository";
import { serviceRepository } from "./repository";
import type { CreateServiceInput, UpdateServiceInput } from "./schemas";

type ServiceRow = NonNullable<
  Awaited<ReturnType<typeof serviceRepository.findById>>
>;

function toServiceResponse(service: ServiceRow) {
  return {
    ...service,
    price: Number(service.price),
  };
}

function toServiceListResponse(
  services: Awaited<ReturnType<typeof serviceRepository.findMany>>,
) {
  return services.map(toServiceResponse);
}

export async function createService(input: CreateServiceInput) {
  const provider = await providerRepository.findById(input.providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const service = await serviceRepository.create(input);
  return toServiceResponse(service);
}

export async function listServices() {
  const services = await serviceRepository.findMany();
  return toServiceListResponse(services);
}

export async function listServicesByProvider(providerId: number) {
  const provider = await providerRepository.findById(providerId);

  if (!provider) {
    throw new NotFoundError("Prestador");
  }

  const services = await serviceRepository.findByProviderId(providerId);
  return toServiceListResponse(services);
}

export async function getServiceById(id: number) {
  const service = await serviceRepository.findById(id);

  if (!service) {
    throw new NotFoundError("Serviço");
  }

  return toServiceResponse(service);
}

export async function updateService(id: number, input: UpdateServiceInput) {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Serviço");
  }

  const service = await serviceRepository.update(id, input);
  return toServiceResponse(service);
}

export async function deleteService(id: number) {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    throw new NotFoundError("Serviço");
  }

  const hasAppointments = await serviceRepository.hasAppointments(id);

  if (hasAppointments) {
    throw new ConflictError(
      "Não é possível remover um serviço com agendamentos vinculados.",
    );
  }

  await serviceRepository.delete(id);
}
