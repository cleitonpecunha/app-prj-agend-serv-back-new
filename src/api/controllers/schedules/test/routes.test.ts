import Fastify, { type FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { errorHandler } from "@/lib/error-handler";
import { providerScheduleRoutes, scheduleRoutes } from "../routes";
import { scheduleRepository } from "../repository";
import { providerRepository } from "../../providers/repository";

jest.mock("@/api/controllers/schedules/repository", () => ({
  scheduleRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByProviderId: jest.fn(),
    findConflicts: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/api/controllers/providers/repository", () => ({
  providerRepository: {
    findById: jest.fn(),
  },
}));

const schRepo = jest.mocked(scheduleRepository);
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
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
};

const mockSchedule = {
  id: 1,
  providerId: 1,
  dayOfWeek: "monday",
  startTime: "09:00",
  endTime: "17:00",
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
};

const validCreatePayload = {
  dayOfWeek: "monday",
  startTime: "09:00",
  endTime: "17:00",
};

const validUpdatePayload = {
  dayOfWeek: "tuesday",
  startTime: "08:00",
  endTime: "12:00",
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
  await app.register(providerScheduleRoutes, { prefix: "/providers" });
  await app.register(scheduleRoutes, { prefix: "/schedules" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("POST /providers/:providerId/schedules", () => {
  it("deve retornar 201 com horário criado", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findConflicts.mockResolvedValue([]);
    schRepo.create.mockResolvedValue(mockSchedule);

    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBe(1);
    expect(body.providerId).toBe(1);
    expect(body.dayOfWeek).toBe("monday");
    expect(body.startTime).toBe("09:00");
    expect(body.endTime).toBe("17:00");
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);
    schRepo.findConflicts.mockResolvedValue([]);

    const response = await app.inject({
      method: "POST",
      url: "/providers/999/schedules",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 409 quando há conflito de horário", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findConflicts.mockResolvedValue([mockSchedule]);

    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 422 quando providerId é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/abc/schedules",
      headers: await buildAuthHeader(1),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando dayOfWeek é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: { ...validCreatePayload, dayOfWeek: "segunda" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "dayOfWeek" })]),
    );
  });

  it("deve retornar 422 quando startTime é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: { ...validCreatePayload, startTime: "25:00" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "startTime" })]),
    );
  });

  it("deve retornar 422 quando endTime é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: { ...validCreatePayload, endTime: "999" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "endTime" })]),
    );
  });

  it("deve retornar 422 quando startTime >= endTime", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: { dayOfWeek: "monday", startTime: "17:00", endTime: "09:00" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "startTime" })]),
    );
  });

  it("deve retornar 422 quando startTime igual a endTime", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(1),
      payload: { dayOfWeek: "monday", startTime: "09:00", endTime: "09:00" },
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("GET /providers/:providerId/schedules", () => {
  it("deve retornar 200 com lista de horários", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule]);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/schedules",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(1);
  });

  it("deve retornar 200 com lista vazia quando prestador não tem horários", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findByProviderId.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/schedules",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/providers/999/schedules",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando providerId é inválido", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/providers/abc/schedules",
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });
});

// ---------------------------------------------------------------------------
describe("PUT /schedules/:id", () => {
  it("deve retornar 200 com horário atualizado", async () => {
    const updated = { ...mockSchedule, ...validUpdatePayload };
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.findConflicts.mockResolvedValue([]);
    schRepo.update.mockResolvedValue(updated);

    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.id).toBe(1);
    expect(body.dayOfWeek).toBe("tuesday");
    expect(body.startTime).toBe("08:00");
  });

  it("deve retornar 404 quando horário não existe", async () => {
    schRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/schedules/999",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 409 quando atualização gera conflito", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.findConflicts.mockResolvedValue([{ ...mockSchedule, id: 2 }]);

    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 422 quando ID é inválido", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/schedules/abc",
      headers: await buildAuthHeader(1),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando dayOfWeek está ausente", async () => {
    const { dayOfWeek: _d, ...payloadSemDia } = validUpdatePayload;

    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      headers: await buildAuthHeader(1),
      payload: payloadSemDia,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "dayOfWeek" })]),
    );
  });

  it("deve retornar 422 quando startTime >= endTime", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      headers: await buildAuthHeader(1),
      payload: { dayOfWeek: "monday", startTime: "18:00", endTime: "09:00" },
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("DELETE /schedules/:id", () => {
  it("deve retornar 204 ao remover horário existente", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.delete.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/1",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("deve retornar 404 quando horário não existe", async () => {
    schRepo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/999",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando ID é inválido", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/abc",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando ID é zero", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/0",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("Autenticação e autorização", () => {
  it("deve retornar 401 ao criar horário sem token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao criar horário de outro prestador", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findConflicts.mockResolvedValue([]);

    const response = await app.inject({
      method: "POST",
      url: "/providers/1/schedules",
      headers: await buildAuthHeader(2),
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao atualizar horário sem token", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao atualizar horário de outro prestador", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);

    const response = await app.inject({
      method: "PUT",
      url: "/schedules/1",
      headers: await buildAuthHeader(2),
      payload: validUpdatePayload,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao remover horário sem token", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/1",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao remover horário de outro prestador", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);

    const response = await app.inject({
      method: "DELETE",
      url: "/schedules/1",
      headers: await buildAuthHeader(2),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });
});
