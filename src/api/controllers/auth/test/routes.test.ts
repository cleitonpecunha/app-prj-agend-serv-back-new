import Fastify, { type FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { errorHandler } from "@/lib/error-handler";
import { hashPassword } from "@/lib/password";
import { authRoutes } from "../routes";
import { providerRepository } from "../../providers/repository";

jest.mock("@/api/controllers/providers/repository", () => ({
  providerRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  },
}));

const repo = jest.mocked(providerRepository);

let app: FastifyInstance;
let passwordHash: string;

const mockProvider = {
  id: 1,
  name: "João Silva",
  businessName: "Barbearia do João",
  slug: "barbearia-do-joao",
  email: "joao@barbearia.com",
  passwordHash: "",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123",
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
};

beforeAll(async () => {
  passwordHash = await hashPassword("12345678");
  app = Fastify({ logger: false });
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "test-access-secret",
  });
  app.setErrorHandler(errorHandler);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /auth/login", () => {
  it("deve retornar tokens e provider público quando credenciais são válidas", async () => {
    repo.findByEmail.mockResolvedValue({
      ...mockProvider,
      passwordHash,
    } as never);

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "joao@barbearia.com",
        password: "12345678",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.refreshToken).toEqual(expect.any(String));
    expect(body.provider.id).toBe(1);
    expect(body.provider.passwordHash).toBeUndefined();
  });

  it("deve retornar 401 quando senha é inválida", async () => {
    repo.findByEmail.mockResolvedValue({
      ...mockProvider,
      passwordHash,
    } as never);

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "joao@barbearia.com",
        password: "senha-errada",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 422 quando e-mail é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "email-invalido",
        password: "12345678",
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });
});

describe("POST /auth/refresh", () => {
  it("deve renovar tokens com refresh token válido", async () => {
    const refreshToken = app.jwt.sign(
      {
        sub: "1",
        providerId: 1,
        email: "joao@barbearia.com",
        tokenType: "refresh",
      },
      { key: process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret" },
    );

    repo.findById.mockResolvedValue({
      ...mockProvider,
      passwordHash,
    } as never);

    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: { refreshToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().accessToken).toEqual(expect.any(String));
    expect(response.json().refreshToken).toEqual(expect.any(String));
  });

  it("deve retornar 401 quando refresh token é inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: { refreshToken: "token-invalido" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 422 quando refreshToken não é enviado", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {},
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("Validation Error");
  });

  it("deve retornar 401 quando token enviado é um access token, não refresh", async () => {
    const accessToken = app.jwt.sign(
      {
        sub: "1",
        providerId: 1,
        email: "joao@barbearia.com",
        tokenType: "access",
      },
      { key: process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret" },
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: { refreshToken: accessToken },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("deve retornar 401 quando provider não existe mais no banco", async () => {
    const refreshToken = app.jwt.sign(
      {
        sub: "999",
        providerId: 999,
        email: "inexistente@email.com",
        tokenType: "refresh",
      },
      { key: process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret" },
    );

    repo.findById.mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: { refreshToken },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });
});
