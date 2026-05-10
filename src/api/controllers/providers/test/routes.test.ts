import Fastify, { type FastifyInstance } from "fastify";
import { errorHandler } from "@/lib/error-handler";
import { providerRoutes } from "../routes";
import { providerRepository } from "../repository";

jest.mock("@/api/controllers/providers/repository", () => ({
  providerRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const repo = jest.mocked(providerRepository);

const mockProvider = {
  id: 1,
  name: "João Silva",
  businessName: "Barbearia do João",
  slug: "barbearia-do-joao",
  email: "joao@barbearia.com",
  passwordHash: "hashed_password",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123 - São Paulo, SP",
  createdAt: new Date("2026-04-25T12:00:00.000Z"),
  updatedAt: new Date("2026-04-25T12:00:00.000Z"),
};

const validPayload = {
  name: "João Silva",
  businessName: "Barbearia do João",
  email: "joao@barbearia.com",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123 - São Paulo, SP",
};

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(providerRoutes, { prefix: "/providers" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("POST /providers", () => {
  it("deve retornar 201 com o prestador criado e slug gerado", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockProvider);

    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBe(1);
    expect(body.slug).toBe("barbearia-do-joao");
  });

  it("deve retornar 422 quando campo obrigatório está ausente (name)", async () => {
    const { name: _name, ...payloadSemName } = validPayload;

    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: payloadSemName,
    });

    expect(response.statusCode).toBe(422);
    const body = response.json();
    expect(body.error).toBe("Validation Error");
    expect(body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })]),
    );
  });

  it("deve retornar 422 quando e-mail tem formato inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: { ...validPayload, email: "email-invalido" },
    });

    expect(response.statusCode).toBe(422);
    const body = response.json();
    expect(body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })]),
    );
  });

  it("deve ignorar slug enviado no payload e gerar internamente a partir de businessName", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockProvider);

    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: { ...validPayload, slug: "slug-enviado-pelo-cliente" },
    });

    expect(response.statusCode).toBe(201);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "barbearia-do-joao" }),
    );
    expect(repo.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ slug: "slug-enviado-pelo-cliente" }),
    );
  });

  it("deve retornar 409 quando e-mail já pertence a outro prestador", async () => {
    repo.findByEmail.mockResolvedValue(mockProvider);
    repo.findBySlug.mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 409 quando businessName gera slug duplicado", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(mockProvider);

    const response = await app.inject({
      method: "POST",
      url: "/providers",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(409);
  });
});

// ---------------------------------------------------------------------------
describe("GET /providers/:id", () => {
  it("deve retornar 200 com o prestador encontrado", async () => {
    repo.findById.mockResolvedValue(mockProvider);

    const response = await app.inject({ method: "GET", url: "/providers/1" });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(1);
    expect(response.json().slug).toBe("barbearia-do-joao");
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/providers/999999",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando ID não é um número", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/providers/abc",
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 422 quando ID é zero", async () => {
    const response = await app.inject({ method: "GET", url: "/providers/0" });

    expect(response.statusCode).toBe(422);
  });

  it("deve retornar 422 quando ID é negativo", async () => {
    const response = await app.inject({ method: "GET", url: "/providers/-1" });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("PUT /providers/:id", () => {
  it("deve retornar 200 com o prestador atualizado", async () => {
    repo.findById.mockResolvedValue(mockProvider);
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.update.mockResolvedValue(mockProvider);

    const response = await app.inject({
      method: "PUT",
      url: "/providers/1",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(1);
  });

  it("deve ignorar slug enviado no payload e recalcular internamente", async () => {
    repo.findById.mockResolvedValue(mockProvider);
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.update.mockResolvedValue(mockProvider);

    await app.inject({
      method: "PUT",
      url: "/providers/1",
      payload: { ...validPayload, slug: "slug-enviado-pelo-cliente" },
    });

    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ slug: "barbearia-do-joao" }),
    );
    expect(repo.update).not.toHaveBeenCalledWith(
      1,
      expect.objectContaining({ slug: "slug-enviado-pelo-cliente" }),
    );
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/providers/999999",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 409 quando e-mail pertence a outro prestador", async () => {
    const otherProvider = { ...mockProvider, id: 2 };
    repo.findById.mockResolvedValue(mockProvider);
    repo.findByEmail.mockResolvedValue(otherProvider);
    repo.findBySlug.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/providers/1",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("ConflictError");
  });

  it("deve retornar 422 quando campo obrigatório está ausente (businessName)", async () => {
    const { businessName: _bn, ...payloadSemBusinessName } = validPayload;

    const response = await app.inject({
      method: "PUT",
      url: "/providers/1",
      payload: payloadSemBusinessName,
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "businessName" }),
      ]),
    );
  });

  it("deve retornar 422 quando ID do path é inválido", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/providers/abc",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
describe("DELETE /providers/:id", () => {
  it("deve retornar 204 sem corpo ao remover prestador existente", async () => {
    repo.findById.mockResolvedValue(mockProvider);
    repo.delete.mockResolvedValue(undefined);

    const response = await app.inject({
      method: "DELETE",
      url: "/providers/1",
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("deve retornar 404 quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "DELETE",
      url: "/providers/999999",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("NotFoundError");
  });

  it("deve retornar 422 quando ID não é um número", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/providers/abc",
    });

    expect(response.statusCode).toBe(422);
  });

  it("deve retornar 422 quando ID é zero", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/providers/0",
    });

    expect(response.statusCode).toBe(422);
  });
});
