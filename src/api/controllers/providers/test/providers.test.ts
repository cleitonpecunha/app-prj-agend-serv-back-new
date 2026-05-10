import {
  createProvider,
  getProviderById,
  updateProvider,
  deleteProvider,
} from "../providers";
import { getProviderRevenue } from "../revenue";
import { getProviderDashboard } from "../dashboard";
import { providerRepository } from "../repository";
import { appointmentRepository } from "../../appointments/repository";
import { AppointmentStatus } from "@/generated/prisma/enums";
import { ConflictError, NotFoundError } from "@/lib/errors";

jest.mock("../repository", () => ({
  providerRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../appointments/repository", () => ({
  appointmentRepository: {
    findByProviderAndMonth: jest.fn(),
  },
}));

const repo = jest.mocked(providerRepository);
const aptRepo = jest.mocked(appointmentRepository);

const mockProvider = {
  id: 1,
  name: "João Silva",
  businessName: "Barbearia do João",
  slug: "barbearia-do-joao",
  email: "joao@barbearia.com",
  passwordHash: "hash-exemplo",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123 - São Paulo, SP",
  createdAt: new Date("2026-04-25T12:00:00.000Z"),
  updatedAt: new Date("2026-04-25T12:00:00.000Z"),
};

const { passwordHash: _passwordHash, ...mockPublicProvider } = mockProvider;

const createInput = {
  name: "João Silva",
  businessName: "Barbearia do João",
  email: "joao@barbearia.com",
  password: "12345678",
  phone: "(11) 99999-0001",
  address: "Rua das Flores, 123 - São Paulo, SP",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("createProvider", () => {
  it("deve criar prestador e retornar registro com slug gerado", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockProvider as never);

    const result = await createProvider(createInput);

    expect(repo.create).toHaveBeenCalledWith({
      name: createInput.name,
      businessName: createInput.businessName,
      email: createInput.email,
      phone: createInput.phone,
      address: createInput.address,
      slug: "barbearia-do-joao",
      passwordHash: expect.any(String),
    });
    expect(result).toEqual(mockPublicProvider);
  });

  it("deve gerar o slug a partir de businessName antes de persistir", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      ...mockProvider,
      businessName: "Estúdio Arte & Cia",
      slug: "estudio-arte-cia",
    } as never);

    await createProvider({
      ...createInput,
      businessName: "Estúdio Arte & Cia",
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "estudio-arte-cia",
        passwordHash: expect.any(String),
      }),
    );
  });

  it("deve lançar ConflictError quando e-mail já existe", async () => {
    repo.findByEmail.mockResolvedValue(mockProvider as never);
    repo.findBySlug.mockResolvedValue(null);

    await expect(createProvider(createInput)).rejects.toThrow(ConflictError);
    await expect(createProvider(createInput)).rejects.toThrow(
      "Já existe um prestador com este e-mail.",
    );
  });

  it("deve lançar ConflictError quando slug já existe", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(mockProvider as never);

    await expect(createProvider(createInput)).rejects.toThrow(ConflictError);
    await expect(createProvider(createInput)).rejects.toThrow(
      "Já existe um prestador com este nome de negócio.",
    );
  });

  it("não deve persistir quando houver conflito de e-mail", async () => {
    repo.findByEmail.mockResolvedValue(mockProvider as never);
    repo.findBySlug.mockResolvedValue(null);

    await expect(createProvider(createInput)).rejects.toThrow();
    expect(repo.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("getProviderById", () => {
  it("deve retornar o prestador quando encontrado", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);

    const result = await getProviderById(1);

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPublicProvider);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(getProviderById(999)).rejects.toThrow(NotFoundError);
    await expect(getProviderById(999)).rejects.toThrow(
      "Prestador não encontrado.",
    );
  });
});

// ---------------------------------------------------------------------------
describe("updateProvider", () => {
  const updateInput = { ...createInput };

  it("deve atualizar prestador e retornar registro com slug recalculado", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(null);
    repo.update.mockResolvedValue({
      ...mockProvider,
      name: "João Atualizado",
    } as never);

    const result = await updateProvider(1, updateInput);

    expect(repo.update).toHaveBeenCalledWith(1, {
      ...updateInput,
      slug: "barbearia-do-joao",
    });
    expect(result.name).toBe("João Atualizado");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("deve permitir atualização quando e-mail e slug pertencem ao próprio prestador", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    repo.findByEmail.mockResolvedValue(mockProvider as never);
    repo.findBySlug.mockResolvedValue(mockProvider as never);
    repo.update.mockResolvedValue(mockProvider as never);

    await expect(updateProvider(1, updateInput)).resolves.toEqual(
      mockPublicProvider,
    );
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(updateProvider(999, updateInput)).rejects.toThrow(
      NotFoundError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando e-mail pertence a outro prestador", async () => {
    const otherProvider = { ...mockProvider, id: 2 };
    repo.findById.mockResolvedValue(mockProvider as never);
    repo.findByEmail.mockResolvedValue(otherProvider as never);
    repo.findBySlug.mockResolvedValue(null);

    await expect(updateProvider(1, updateInput)).rejects.toThrow(ConflictError);
    await expect(updateProvider(1, updateInput)).rejects.toThrow(
      "Já existe um prestador com este e-mail.",
    );
  });

  it("deve lançar ConflictError quando slug pertence a outro prestador", async () => {
    const otherProvider = { ...mockProvider, id: 2 };
    repo.findById.mockResolvedValue(mockProvider as never);
    repo.findByEmail.mockResolvedValue(null);
    repo.findBySlug.mockResolvedValue(otherProvider as never);

    await expect(updateProvider(1, updateInput)).rejects.toThrow(ConflictError);
    await expect(updateProvider(1, updateInput)).rejects.toThrow(
      "Já existe um prestador com este nome de negócio.",
    );
  });
});

// ---------------------------------------------------------------------------
describe("deleteProvider", () => {
  it("deve remover o prestador quando encontrado", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    repo.delete.mockResolvedValue(undefined);

    await expect(deleteProvider(1)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(deleteProvider(999)).rejects.toThrow(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
const mockAppointmentWithService = {
  id: 1,
  providerId: 1,
  serviceId: 10,
  appointmentDate: new Date("2026-05-05T00:00:00.000Z"),
  startTime: "09:00",
  status: AppointmentStatus.scheduled,
  clientName: "Maria Souza",
  clientEmail: "maria@email.com",
  clientPhone: "(11) 99999-1111",
  notes: null,
  createdAt: new Date("2026-04-27T10:00:00.000Z"),
  updatedAt: new Date("2026-04-27T10:00:00.000Z"),
  service: { name: "Corte de cabelo", price: 50 },
};

describe("getProviderRevenue", () => {
  it("deve retornar faturamento previsto com agendamento scheduled", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      mockAppointmentWithService,
    ] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "day",
    });

    expect(result.month).toBe("2026-05");
    expect(result.groupBy).toBe("day");
    expect(result.summary.scheduledRevenue).toBe(50);
    expect(result.summary.completedRevenue).toBe(0);
    expect(result.summary.totalAppointmentsConsidered).toBe(1);
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].label).toBe("2026-05-05");
    expect(result.buckets[0].scheduledRevenue).toBe(50);
    expect(result.buckets[0].completedRevenue).toBe(0);
    expect(result.buckets[0].appointmentCount).toBe(1);
  });

  it("deve incluir faturamento realizado de agendamento completed", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      { ...mockAppointmentWithService, status: AppointmentStatus.completed },
    ] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "day",
    });

    expect(result.summary.completedRevenue).toBe(50);
    expect(result.summary.scheduledRevenue).toBe(0);
  });

  it("deve excluir canceled e no_show do faturamento", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      {
        ...mockAppointmentWithService,
        id: 2,
        status: AppointmentStatus.canceled,
      },
      {
        ...mockAppointmentWithService,
        id: 3,
        status: AppointmentStatus.no_show,
      },
    ] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "day",
    });

    expect(result.summary.scheduledRevenue).toBe(0);
    expect(result.summary.completedRevenue).toBe(0);
    expect(result.summary.totalAppointmentsConsidered).toBe(0);
    expect(result.buckets).toHaveLength(0);
  });

  it("deve agrupar por week com label correto", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      mockAppointmentWithService, // dia 5 → semana 1
      {
        ...mockAppointmentWithService,
        id: 2,
        appointmentDate: new Date("2026-05-12T00:00:00.000Z"), // dia 12 → semana 2
        service: { name: "Barba", price: 30 },
      },
    ] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "week",
    });

    expect(result.buckets).toHaveLength(2);
    expect(result.buckets[0].label).toBe("Semana 1");
    expect(result.buckets[1].label).toBe("Semana 2");
    expect(result.summary.scheduledRevenue).toBe(80);
  });

  it("deve agrupar por month com bucket único", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      mockAppointmentWithService,
      {
        ...mockAppointmentWithService,
        id: 2,
        appointmentDate: new Date("2026-05-20T00:00:00.000Z"),
      },
    ] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "month",
    });

    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].label).toBe("2026-05");
    expect(result.buckets[0].appointmentCount).toBe(2);
    expect(result.summary.scheduledRevenue).toBe(100);
  });

  it("deve retornar faturamento zerado quando não há agendamentos", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([] as never);

    const result = await getProviderRevenue(1, {
      month: "2026-05",
      groupBy: "day",
    });

    expect(result.summary.scheduledRevenue).toBe(0);
    expect(result.summary.completedRevenue).toBe(0);
    expect(result.buckets).toHaveLength(0);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      getProviderRevenue(999, { month: "2026-05", groupBy: "day" }),
    ).rejects.toThrow(NotFoundError);
    expect(aptRepo.findByProviderAndMonth).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("getProviderDashboard", () => {
  it("deve retornar resumo correto com agendamentos variados", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      {
        ...mockAppointmentWithService,
        id: 1,
        status: AppointmentStatus.scheduled,
      },
      {
        ...mockAppointmentWithService,
        id: 2,
        status: AppointmentStatus.completed,
      },
      {
        ...mockAppointmentWithService,
        id: 3,
        status: AppointmentStatus.canceled,
      },
      {
        ...mockAppointmentWithService,
        id: 4,
        status: AppointmentStatus.no_show,
      },
    ] as never);

    const result = await getProviderDashboard(1, "2026-05");

    expect(result.referenceMonth).toBe("2026-05");
    expect(result.totalAppointments).toBe(4);
    expect(result.scheduledAppointments).toBe(1);
    expect(result.completedAppointments).toBe(1);
    expect(result.canceledAppointments).toBe(1);
    expect(result.noShowAppointments).toBe(1);
    expect(result.scheduledRevenue).toBe(50);
    expect(result.completedRevenue).toBe(50);
  });

  it("deve calcular attendanceRate corretamente", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      {
        ...mockAppointmentWithService,
        id: 1,
        status: AppointmentStatus.completed,
      },
      {
        ...mockAppointmentWithService,
        id: 2,
        status: AppointmentStatus.completed,
      },
      {
        ...mockAppointmentWithService,
        id: 3,
        status: AppointmentStatus.no_show,
      },
    ] as never);

    const result = await getProviderDashboard(1, "2026-05");

    // 2 completed / (2 completed + 1 no_show) = 66.67%
    expect(result.attendanceRate).toBe(66.67);
  });

  it("deve retornar attendanceRate null quando não há desfechos", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([
      {
        ...mockAppointmentWithService,
        id: 1,
        status: AppointmentStatus.scheduled,
      },
    ] as never);

    const result = await getProviderDashboard(1, "2026-05");

    expect(result.attendanceRate).toBeNull();
  });

  it("deve retornar resumo zerado quando não há agendamentos", async () => {
    repo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderAndMonth.mockResolvedValue([] as never);

    const result = await getProviderDashboard(1, "2026-05");

    expect(result.totalAppointments).toBe(0);
    expect(result.scheduledRevenue).toBe(0);
    expect(result.completedRevenue).toBe(0);
    expect(result.attendanceRate).toBeNull();
    expect(result.nextAppointments).toHaveLength(0);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(getProviderDashboard(999, "2026-05")).rejects.toThrow(
      NotFoundError,
    );
    expect(aptRepo.findByProviderAndMonth).not.toHaveBeenCalled();
  });
});
