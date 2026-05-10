import {
  createSchedule,
  listSchedulesByProvider,
  updateSchedule,
  deleteSchedule,
} from "../schedules";
import { scheduleRepository } from "../repository";
import { providerRepository } from "../../providers/repository";
import { ConflictError, NotFoundError } from "@/lib/errors";

jest.mock("../repository", () => ({
  scheduleRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByProviderId: jest.fn(),
    findConflicts: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../providers/repository", () => ({
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

const createInput = {
  dayOfWeek: "monday" as const,
  startTime: "09:00",
  endTime: "17:00",
};

const updateInput = {
  dayOfWeek: "tuesday" as const,
  startTime: "08:00",
  endTime: "12:00",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
describe("createSchedule", () => {
  it("deve criar horário quando prestador existe e não há conflito", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findConflicts.mockResolvedValue([]);
    schRepo.create.mockResolvedValue(mockSchedule);

    const result = await createSchedule(1, createInput);

    expect(prvRepo.findById).toHaveBeenCalledWith(1);
    expect(schRepo.findConflicts).toHaveBeenCalledWith({
      providerId: 1,
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "17:00",
    });
    expect(schRepo.create).toHaveBeenCalledWith({
      ...createInput,
      providerId: 1,
    });
    expect(result).toEqual(mockSchedule);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    await expect(createSchedule(999, createInput)).rejects.toThrow(
      NotFoundError,
    );
    await expect(createSchedule(999, createInput)).rejects.toThrow(
      "Prestador não encontrado.",
    );
    expect(schRepo.create).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando há sobreposição de horário", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findConflicts.mockResolvedValue([mockSchedule]);

    await expect(createSchedule(1, createInput)).rejects.toThrow(ConflictError);
    await expect(createSchedule(1, createInput)).rejects.toThrow(
      "Já existe um horário cadastrado que conflita com o intervalo informado.",
    );
    expect(schRepo.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("listSchedulesByProvider", () => {
  it("deve retornar horários do prestador ordenados por dia e hora", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    const friday = {
      ...mockSchedule,
      id: 2,
      dayOfWeek: "friday",
      startTime: "09:00",
      endTime: "17:00",
    };
    const mondayLate = {
      ...mockSchedule,
      id: 3,
      dayOfWeek: "monday",
      startTime: "14:00",
      endTime: "18:00",
    };
    schRepo.findByProviderId.mockResolvedValue([
      friday,
      mondayLate,
      mockSchedule,
    ]);

    const result = await listSchedulesByProvider(1);

    expect(prvRepo.findById).toHaveBeenCalledWith(1);
    expect(result[0].dayOfWeek).toBe("monday");
    expect(result[0].startTime).toBe("09:00");
    expect(result[1].dayOfWeek).toBe("monday");
    expect(result[1].startTime).toBe("14:00");
    expect(result[2].dayOfWeek).toBe("friday");
  });

  it("deve retornar lista vazia quando prestador não tem horários", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider);
    schRepo.findByProviderId.mockResolvedValue([]);

    const result = await listSchedulesByProvider(1);

    expect(result).toEqual([]);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null);

    await expect(listSchedulesByProvider(999)).rejects.toThrow(NotFoundError);
    await expect(listSchedulesByProvider(999)).rejects.toThrow(
      "Prestador não encontrado.",
    );
    expect(schRepo.findByProviderId).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("updateSchedule", () => {
  it("deve atualizar horário existente sem conflito", async () => {
    const updated = { ...mockSchedule, ...updateInput };
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.findConflicts.mockResolvedValue([]);
    schRepo.update.mockResolvedValue(updated);

    const result = await updateSchedule(1, updateInput);

    expect(schRepo.findConflicts).toHaveBeenCalledWith({
      providerId: 1,
      dayOfWeek: "tuesday",
      startTime: "08:00",
      endTime: "12:00",
      ignoreId: 1,
    });
    expect(schRepo.update).toHaveBeenCalledWith(1, updateInput);
    expect(result).toEqual(updated);
  });

  it("deve lançar NotFoundError quando horário não existe", async () => {
    schRepo.findById.mockResolvedValue(null);

    await expect(updateSchedule(999, updateInput)).rejects.toThrow(
      NotFoundError,
    );
    await expect(updateSchedule(999, updateInput)).rejects.toThrow(
      "Horário não encontrado.",
    );
    expect(schRepo.update).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando atualização gera sobreposição", async () => {
    const other = { ...mockSchedule, id: 2 };
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.findConflicts.mockResolvedValue([other]);

    await expect(updateSchedule(1, updateInput)).rejects.toThrow(ConflictError);
    expect(schRepo.update).not.toHaveBeenCalled();
  });

  it("deve ignorar o próprio registro ao verificar conflito", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.findConflicts.mockResolvedValue([]);
    schRepo.update.mockResolvedValue({ ...mockSchedule, ...updateInput });

    await updateSchedule(1, updateInput);

    expect(schRepo.findConflicts).toHaveBeenCalledWith(
      expect.objectContaining({ ignoreId: 1 }),
    );
  });
});

// ---------------------------------------------------------------------------
describe("deleteSchedule", () => {
  it("deve remover horário existente", async () => {
    schRepo.findById.mockResolvedValue(mockSchedule);
    schRepo.delete.mockResolvedValue(undefined);

    await expect(deleteSchedule(1)).resolves.toBeUndefined();
    expect(schRepo.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar NotFoundError quando horário não existe", async () => {
    schRepo.findById.mockResolvedValue(null);

    await expect(deleteSchedule(999)).rejects.toThrow(NotFoundError);
    await expect(deleteSchedule(999)).rejects.toThrow(
      "Horário não encontrado.",
    );
    expect(schRepo.delete).not.toHaveBeenCalled();
  });
});
