import {
  createService,
  listServices,
  listServicesByProvider,
  getServiceById,
  updateService,
  deleteService,
} from "../services";
import { serviceRepository } from "../repository";
import { providerRepository } from "../../providers/repository";
import { ConflictError, NotFoundError } from "@/lib/errors";

jest.mock("../repository", () => ({
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

jest.mock("../../providers/repository", () => ({
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
  price: 50.0,
  isActive: true,
  createdAt: new Date("2026-04-25T12:00:00.000Z"),
  updatedAt: new Date("2026-04-25T12:00:00.000Z"),
};

const createInput = {
  providerId: 1,
  name: "Corte de cabelo",
  description: "Corte masculino completo",
  durationMinutes: 30,
  price: 50.0,
  isActive: true,
};

const updateInput = {
  name: "Corte de cabelo premium",
  description: "Corte masculino com acabamento",
  durationMinutes: 45,
  price: 75.0,
  isActive: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("createService", () => {
  it("deve criar serviço quando prestador existe", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.create.mockResolvedValue(mockService);

    const result = await createService(createInput);

    expect(prvRepo.findById).toHaveBeenCalledWith(1);
    expect(svcRepo.create).toHaveBeenCalledWith(createInput);
    expect(result).toEqual({ ...mockService, price: 50 });
  });

  it("deve converter price de Decimal para number na saída", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.create.mockResolvedValue({ ...mockService, price: 99.9 });

    const result = await createService(createInput);

    expect(typeof result.price).toBe("number");
    expect(result.price).toBe(99.9);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    await expect(createService(createInput)).rejects.toThrow(NotFoundError);
    await expect(createService(createInput)).rejects.toThrow(
      "Prestador não encontrado.",
    );
    expect(svcRepo.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("listServices", () => {
  it("deve retornar lista de todos os serviços com price convertido", async () => {
    svcRepo.findMany.mockResolvedValue([
      mockService,
      { ...mockService, id: 2 },
    ]);

    const result = await listServices();

    expect(svcRepo.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(50);
  });

  it("deve retornar lista vazia quando não há serviços", async () => {
    svcRepo.findMany.mockResolvedValue([]);

    const result = await listServices();

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe("listServicesByProvider", () => {
  it("deve retornar serviços do prestador quando ele existe", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.findByProviderId.mockResolvedValue([mockService]);

    const result = await listServicesByProvider(1);

    expect(prvRepo.findById).toHaveBeenCalledWith(1);
    expect(svcRepo.findByProviderId).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(50);
  });

  it("deve retornar lista vazia quando prestador não tem serviços", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    svcRepo.findByProviderId.mockResolvedValue([]);

    const result = await listServicesByProvider(1);

    expect(result).toEqual([]);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    await expect(listServicesByProvider(999)).rejects.toThrow(NotFoundError);
    await expect(listServicesByProvider(999)).rejects.toThrow(
      "Prestador não encontrado.",
    );
    expect(svcRepo.findByProviderId).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("getServiceById", () => {
  it("deve retornar serviço existente com price convertido", async () => {
    svcRepo.findById.mockResolvedValue(mockService);

    const result = await getServiceById(1);

    expect(svcRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ ...mockService, price: 50 });
  });

  it("deve lançar NotFoundError quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    await expect(getServiceById(999)).rejects.toThrow(NotFoundError);
    await expect(getServiceById(999)).rejects.toThrow(
      "Serviço não encontrado.",
    );
  });
});

// ---------------------------------------------------------------------------
describe("updateService", () => {
  it("deve atualizar serviço existente e retornar com price convertido", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.update.mockResolvedValue({ ...mockService, ...updateInput });

    const result = await updateService(1, updateInput);

    expect(svcRepo.update).toHaveBeenCalledWith(1, updateInput);
    expect(result.price).toBe(75);
  });

  it("deve lançar NotFoundError quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    await expect(updateService(999, updateInput)).rejects.toThrow(
      NotFoundError,
    );
    expect(svcRepo.update).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("deleteService", () => {
  it("deve remover serviço quando não há agendamentos vinculados", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.hasAppointments.mockResolvedValue(false);
    svcRepo.delete.mockResolvedValue(undefined);

    await expect(deleteService(1)).resolves.toBeUndefined();
    expect(svcRepo.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar ConflictError quando existem agendamentos vinculados", async () => {
    svcRepo.findById.mockResolvedValue(mockService);
    svcRepo.hasAppointments.mockResolvedValue(true);

    await expect(deleteService(1)).rejects.toThrow(ConflictError);
    await expect(deleteService(1)).rejects.toThrow(
      "Não é possível remover um serviço com agendamentos vinculados.",
    );
    expect(svcRepo.delete).not.toHaveBeenCalled();
  });

  it("deve lançar NotFoundError quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null);

    await expect(deleteService(999)).rejects.toThrow(NotFoundError);
    expect(svcRepo.hasAppointments).not.toHaveBeenCalled();
    expect(svcRepo.delete).not.toHaveBeenCalled();
  });
});
