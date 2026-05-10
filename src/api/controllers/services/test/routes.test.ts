import Fastify, { type FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { Decimal } from "@prisma/client/runtime/client";
import { errorHandler } from "@/lib/error-handler";
import { serviceRoutes, providerServiceRoutes } from "../routes";
import { serviceRepository } from "../repository";
import { providerRepository } from "../../providers/repository";

jest.mock("@/api/controllers/services/repository", () => ({
  serviceRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    findByProviderId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hasAppointments: jest.fn(),
  },
}));

jest.mock("@/api/controllers/providers/repository", () => ({
  providerRepository: {
    findById: jest.fn(),
  },
}));

const svcRepo = jest.mocked(serviceRepository);
const prvRepo = jest.mocked(providerRepository);

const mockProvider = {
  id: 1,
  name: "João Silva",
  businessName: "Barbearia do João",
  slug: "barbearia-do-joao",
  email: "joao@barbearia.com",
  passwordHash: "hashed_password",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123",
  createdAt: new Date("2026-04-25T12:00:00.000Z"),
  updatedAt: new Date("2026-04-25T12:00:00.000Z"),
};

const mockService = {
  id: 1,
  providerId: 1,
  name: "Corte de cabelo",
  description: "Corte masculino completo",
  durationMinutes: 30,
  price: new Decimal(50.0),
  isActive: true,
  createdAt: new Date("2026-04-25T12:00:00.000Z"),
  updatedAt: new Date("2026-04-25T12:00:00.000Z"),
};

const validCreatePayload = {
  providerId: 1,
  name: "Corte de cabelo",
  description: "Corte masculino completo",
  durationMinutes: 30,
  price: 50.0,
  isActive: true,
};

const validUpdatePayload = {
  name: "Corte de cabelo premium",
  description: "Corte masculino com acabamento",
  durationMinutes: 45,
  price: 75.0,
  isActive: true,
};

let app: FastifyInstance;

async function buildAuthHeader(providerId = 1) {
  const token = await app.jwt.sign({
    sub: String(providerId),
    providerId,
    email: "joao@barbearia.com",
    tokenType: "access",
  });

  return { authorization: `Bearer ${token}` };
}

beforeAll(async () => {
  app = Fastify({ logger: false });
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "test-access-secret",
  });
  app.setErrorHandler(errorHandler);
  await app.register(serviceRoutes, { prefix: "/services" });
  await app.register(providerServiceRoutes, { prefix: "/providers" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("POST /services", () => {
  it("deve retornar 201 com serviço criado e price como number", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.create.mockResolvedValue(mockService);

    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBe(1);
    expect(body.providerId).toBe(1);
    expect(typeof body.price).toBe("number");
    expect(body.price).toBe(50);
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando name está ausente", async () => {
    const { name: _name, ...payloadSemName } = validCreatePayload;

    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: payloadSemName,
    });

    expect(response.statusCode).toBe(422);
    const body = response.json();
    expect(body.error).toBe("Validation Error");
    expect(body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })]),
    );
  });

  it("deve retornar 422 quando durationMinutes é zero", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: { ...validCreatePayload, durationMinutes: 0 },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "durationMinutes" }),
      ]),
    );
  });

  it("deve retornar 422 quando price é negativo", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: { ...validCreatePayload, price: -10 },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "price" })]),
    );
  });

  it("deve usar isActive true como padrão quando não enviado", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.create.mockResolvedValue(mockService);
    const { isActive: _isActive, ...payloadSemIsActive } = validCreatePayload;

    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(1),
      payload: payloadSemIsActive,
    });

    expect(response.statusCode).toBe(201);
    expect(svcRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });
});

// ---------------------------------------------------------------------------
describe("GET /services", () => {
  it("deve retornar 200 com lista de serviços", async () => {
    svcRepo.findMany.mockResolvedValue([mockService]);

    const response = await app.inject({ method: "GET", url: "/services" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(typeof body[0].price).toBe("number");
  });

  it("deve retornar 200 com lista vazia quando não há serviços", async () => {
    svcRepo.findMany.mockResolvedValue([]);

    const response = await app.inject({ method: "GET", url: "/services" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe("GET /services/:id", () => {
  it("deve retornar 200 com serviço encontrado", async () => {
    svcRepo.findById.mockResolvedValue(mockService);

    const response = await app.inject({ method: "GET", url: "/services/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(1);
    expect(typeof response.json().price).toBe("number");
  });

  it("deve retornar 404 quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/services/999999",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando ID não é número", async () => {
    const response = await app.inject({ method: "GET", url: "/services/abc" });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando ID é zero", async () => {
    const response = await app.inject({ method: "GET", url: "/services/0" });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("PUT /services/:id", () => {
  it("deve retornar 200 com serviço atualizado", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.update.mockResolvedValue({
      ...mockService,
      ...validUpdatePayload,
      price: new Decimal(validUpdatePayload.price),
    });

    const response = await app.inject({
      method: "PUT",
      url: "/services/1",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(1);
    expect(typeof response.json().price).toBe("number");
  });

  it("deve retornar 404 quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/services/999999",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando description está ausente", async () => {
    const { description: _desc, ...payloadSemDesc } = validUpdatePayload;

    const response = await app.inject({
      method: "PUT",
      url: "/services/1",
      headers: await buildAuthHeader(1),
      payload: payloadSemDesc,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "description" }),
      ]),
    );
  });

  it("deve retornar 422 quando ID do path é inválido", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/services/abc",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("DELETE /services/:id", () => {
  it("deve retornar 204 ao remover serviço sem agendamentos", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.hasAppointments.mockResolvedValue(false);
    svcRepo.delete.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "DELETE",
      url: "/services/1",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("deve retornar 409 quando existem agendamentos vinculados", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.hasAppointments.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: "/services/1",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
    expect(response.json().message).toBe(
      "Não é possível remover um serviço com agendamentos vinculados.",
    );
  });

  it("deve retornar 404 quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "DELETE",
      url: "/services/999999",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando ID é inválido", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/services/abc",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("GET /providers/:providerId/services", () => {
  it("deve retornar 200 com serviços do prestador", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.findByProviderId.mockResolvedValue([mockService]);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/services",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(typeof body[0].price).toBe("number");
  });

  it("deve retornar 200 com lista vazia quando prestador não tem serviços", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.findByProviderId.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/services",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/providers/999999/services",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando providerId não é número", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/providers/abc/services",
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });
});

// ---------------------------------------------------------------------------
describe("Autenticação e autorização", () => {
  it("deve retornar 401 ao criar serviço sem token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/services",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao criar serviço com token de outro prestador", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.create.mockResolvedValue(mockService);

    const response = await app.inject({
      method: "POST",
      url: "/services",
      headers: await buildAuthHeader(2),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao atualizar serviço sem token", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/services/1",
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao atualizar serviço de outro prestador", async () => {
    svcRepo.findById.mockResolvedValue(mockService);

    const response = await app.inject({
      method: "PUT",
      url: "/services/1",
      headers: await buildAuthHeader(2),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao remover serviço sem token", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/services/1",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao remover serviço de outro prestador", async () => {
    svcRepo.findById.mockResolvedValue(mockService);

    const response = await app.inject({
      method: "DELETE",
      url: "/services/1",
      headers: await buildAuthHeader(2),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });
});
