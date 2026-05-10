import Fastify, { type FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { AppointmentStatus } from "@/generated/prisma/enums";
import { errorHandler } from "@/lib/error-handler";
import {
  appointmentRoutes,
  providerAppointmentRoutes,
  serviceAppointmentRoutes,
} from "../routes";
import { appointmentRepository } from "../repository";
import { providerRepository } from "../../providers/repository";
import { scheduleRepository } from "../../schedules/repository";
import { serviceRepository } from "../../services/repository";

jest.mock("@/api/controllers/appointments/repository", () => ({
  appointmentRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByProviderId: jest.fn(),
    findByProviderAndDate: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

jest.mock("@/api/controllers/providers/repository", () => ({
  providerRepository: {
    findById: jest.fn(),
  },
}));

jest.mock("@/api/controllers/schedules/repository", () => ({
  scheduleRepository: {
    findByProviderId: jest.fn(),
  },
}));

jest.mock("@/api/controllers/services/repository", () => ({
  serviceRepository: {
    findById: jest.fn(),
  },
}));

jest.mock("@/lib/appointment-notifications", () => ({
  sendAppointmentConfirmationToClient: jest.fn().mockResolvedValue(undefined),
  sendNewAppointmentNotificationToProvider: jest.fn().mockResolvedValue(undefined),
}));

const aptRepo = jest.mocked(appointmentRepository);
const prvRepo = jest.mocked(providerRepository);
const schRepo = jest.mocked(scheduleRepository);
const svcRepo = jest.mocked(serviceRepository);

const mockProvider = {
  id: 1,
  name: "João Silva",
  businessName: "Barbearia do João",
  slug: "barbearia-do-joao",
  email: "joao@barbearia.com",
  passwordHash: "hashed-password",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123",
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
};

const mockService = {
  id: 10,
  providerId: 1,
  name: "Corte de cabelo",
  description: "Corte masculino completo",
  durationMinutes: 30,
  price: 50,
  isActive: true,
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

const mockAppointment = {
  id: 1,
  providerId: 1,
  serviceId: 10,
  appointmentDate: new Date("2026-05-11T00:00:00.000Z"),
  startTime: "09:00",
  status: AppointmentStatus.scheduled,
  clientName: "Maria Souza",
  clientEmail: "maria@email.com",
  clientPhone: "(11) 99999-1111",
  notes: "Primeira visita",
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
};

const validCreatePayload = {
  appointmentDate: "2026-05-11",
  startTime: "09:00",
  clientName: "Maria Souza",
  clientEmail: "maria@email.com",
  clientPhone: "(11) 99999-1111",
  notes: "Primeira visita",
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
  await app.register(serviceAppointmentRoutes, { prefix: "/services" });
  await app.register(providerAppointmentRoutes, { prefix: "/providers" });
  await app.register(appointmentRoutes, { prefix: "/appointments" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /services/:serviceId/appointments", () => {
  it("deve retornar 201 com agendamento criado", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([] as never);
    aptRepo.create.mockResolvedValue(mockAppointment as never);
    prvRepo.findById.mockResolvedValue(mockProvider as never);

    const response = await app.inject({
      method: "POST",
      url: "/services/10/appointments",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().id).toBe(1);
    expect(response.json().appointmentDate).toBe("2026-05-11");
  });

  it("deve retornar 404 quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null as never);

    const response = await app.inject({
      method: "POST",
      url: "/services/999/appointments",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 409 quando serviço está inativo", async () => {
    svcRepo.findById.mockResolvedValue({
      ...mockService,
      isActive: false,
    } as never);

    const response = await app.inject({
      method: "POST",
      url: "/services/10/appointments",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 409 quando já existe conflito de agendamento", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([
      {
        ...mockAppointment,
        id: 2,
        startTime: "09:15",
        service: { durationMinutes: 30 },
      },
    ] as never);

    const response = await app.inject({
      method: "POST",
      url: "/services/10/appointments",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 422 quando serviceId é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/services/abc/appointments",
      payload: validCreatePayload,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando clientEmail é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/services/10/appointments",
      payload: { ...validCreatePayload, clientEmail: "email-invalido" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "clientEmail" }),
      ]),
    );
  });
});

describe("GET /providers/:providerId/appointments", () => {
  it("deve retornar 200 com lista de agendamentos", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderId.mockResolvedValue([mockAppointment] as never);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/appointments",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(1);
    expect(response.json()[0].appointmentDate).toBe("2026-05-11");
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null as never);

    const response = await app.inject({
      method: "GET",
      url: "/providers/999/appointments",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando providerId é inválido", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/providers/abc/appointments",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(422);
  });
});

describe("GET /appointments/:id", () => {
  it("deve retornar 200 com agendamento encontrado", async () => {
    aptRepo.findById.mockResolvedValue(mockAppointment as never);

    const response = await app.inject({
      method: "GET",
      url: "/appointments/1",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(1);
    expect(response.json().appointmentDate).toBe("2026-05-11");
  });

  it("deve retornar 404 quando agendamento não existe", async () => {
    aptRepo.findById.mockResolvedValue(null as never);

    const response = await app.inject({
      method: "GET",
      url: "/appointments/999",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve retornar 422 quando id é inválido", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/appointments/abc",
      headers: await buildAuthHeader(1),
    });

    expect(response.statusCode).toBe(422);
  });
});

describe("PATCH /appointments/:id/status", () => {
  it("deve retornar 200 com status atualizado", async () => {
    aptRepo.findById.mockResolvedValue(mockAppointment as never);
    aptRepo.updateStatus.mockResolvedValue({
      ...mockAppointment,
      status: AppointmentStatus.completed,
    } as never);

    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/1/status",
      headers: await buildAuthHeader(1),
      payload: { status: "completed" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("completed");
    expect(response.json().appointmentDate).toBe("2026-05-11");
  });

  it("deve retornar 404 quando agendamento não existe", async () => {
    aptRepo.findById.mockResolvedValue(null as never);

    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/999/status",
      headers: await buildAuthHeader(1),
      payload: { status: "completed" },
    });

    expect(response.statusCode).toBe(404);
  });

  it("deve retornar 409 quando status não pode mais ser alterado", async () => {
    aptRepo.findById.mockResolvedValue({
      ...mockAppointment,
      status: AppointmentStatus.canceled,
    } as never);

    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/1/status",
      headers: await buildAuthHeader(1),
      payload: { status: "completed" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 422 quando status é inválido", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/1/status",
      headers: await buildAuthHeader(1),
      payload: { status: "scheduled" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });
});

// ---------------------------------------------------------------------------
describe("Autenticação e autorização", () => {
  it("deve retornar 401 ao listar agendamentos do prestador sem token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/providers/1/appointments",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao listar agendamentos de outro prestador", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);

    const response = await app.inject({
      method: "GET",
      url: "/providers/1/appointments",
      headers: await buildAuthHeader(2),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao buscar agendamento por ID sem token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/appointments/1",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao buscar agendamento de outro prestador", async () => {
    aptRepo.findById.mockResolvedValue(mockAppointment);

    const response = await app.inject({
      method: "GET",
      url: "/appointments/1",
      headers: await buildAuthHeader(2),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });

  it("deve retornar 401 ao atualizar status de agendamento sem token", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/1/status",
      payload: { status: "completed" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 403 ao atualizar status de agendamento de outro prestador", async () => {
    aptRepo.findById.mockResolvedValue(mockAppointment);

    const response = await app.inject({
      method: "PATCH",
      url: "/appointments/1/status",
      headers: await buildAuthHeader(2),
      payload: { status: "completed" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("ForbiddenError");
  });
});
