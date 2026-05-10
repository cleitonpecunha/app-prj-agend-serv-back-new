import { AppointmentStatus } from "@/generated/prisma/enums";
import {
  sendAppointmentConfirmationToClient,
  sendNewAppointmentNotificationToProvider,
} from "@/lib/appointment-notifications";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  createAppointment,
  getAppointmentById,
  listAppointmentsByProvider,
  updateAppointmentStatus,
} from "../appointments";
import { appointmentRepository } from "../repository";
import { providerRepository } from "../../providers/repository";
import { scheduleRepository } from "../../schedules/repository";
import { serviceRepository } from "../../services/repository";

jest.mock("@/lib/appointment-notifications", () => ({
  sendAppointmentConfirmationToClient: jest.fn(),
  sendNewAppointmentNotificationToProvider: jest.fn(),
}));

const notifyClient = jest.mocked(sendAppointmentConfirmationToClient);
const notifyProvider = jest.mocked(sendNewAppointmentNotificationToProvider);

jest.mock("../repository", () => ({
  appointmentRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByProviderId: jest.fn(),
    findByProviderAndDate: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

jest.mock("../../providers/repository", () => ({
  providerRepository: {
    findById: jest.fn(),
  },
}));

jest.mock("../../schedules/repository", () => ({
  scheduleRepository: {
    findByProviderId: jest.fn(),
  },
}));

jest.mock("../../services/repository", () => ({
  serviceRepository: {
    findById: jest.fn(),
  },
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

const createInput = {
  appointmentDate: "2026-05-11",
  startTime: "09:00",
  clientName: "Maria Souza",
  clientEmail: "maria@email.com",
  clientPhone: "(11) 99999-1111",
  notes: "Primeira visita",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createAppointment", () => {
  it("deve criar agendamento e disparar notificações para cliente e prestador", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([] as never);
    aptRepo.create.mockResolvedValue(mockAppointment as never);
    prvRepo.findById.mockResolvedValue(mockProvider as never);
    notifyClient.mockResolvedValue(undefined);
    notifyProvider.mockResolvedValue(undefined);

    const result = await createAppointment(10, createInput);

    expect(svcRepo.findById).toHaveBeenCalledWith(10);
    expect(schRepo.findByProviderId).toHaveBeenCalledWith(1);
    expect(aptRepo.findByProviderAndDate).toHaveBeenCalledWith(
      1,
      new Date("2026-05-11T00:00:00.000Z"),
    );
    expect(aptRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: 1,
        serviceId: 10,
        startTime: "09:00",
        clientName: "Maria Souza",
      }),
    );
    expect(notifyClient).toHaveBeenCalledWith(
      expect.objectContaining({
        clientEmail: "maria@email.com",
        serviceName: "Corte de cabelo",
        providerBusinessName: "Barbearia do João",
      }),
    );
    expect(notifyProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEmail: "joao@barbearia.com",
        clientName: "Maria Souza",
        serviceName: "Corte de cabelo",
      }),
    );
    expect(result).toEqual({
      ...mockAppointment,
      appointmentDate: "2026-05-11",
    });
  });

  it("deve lançar NotFoundError quando serviço não existe", async () => {
    svcRepo.findById.mockResolvedValue(null as never);

    await expect(createAppointment(999, createInput)).rejects.toThrow(
      NotFoundError,
    );
    expect(schRepo.findByProviderId).not.toHaveBeenCalled();
    expect(notifyClient).not.toHaveBeenCalled();
    expect(notifyProvider).not.toHaveBeenCalled();
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([] as never);
    aptRepo.create.mockResolvedValue(mockAppointment as never);
    prvRepo.findById.mockResolvedValue(null as never);

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      NotFoundError,
    );
    expect(notifyClient).not.toHaveBeenCalled();
    expect(notifyProvider).not.toHaveBeenCalled();
  });

  it("deve propagar erro quando envio de e-mail para cliente falha", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([] as never);
    aptRepo.create.mockResolvedValue(mockAppointment as never);
    prvRepo.findById.mockResolvedValue(mockProvider as never);
    notifyClient.mockRejectedValue(new Error("SMTP indisponível"));

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      "SMTP indisponível",
    );
    expect(notifyProvider).not.toHaveBeenCalled();
  });

  it("deve propagar erro quando envio de e-mail para prestador falha", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([mockSchedule] as never);
    aptRepo.findByProviderAndDate.mockResolvedValue([] as never);
    aptRepo.create.mockResolvedValue(mockAppointment as never);
    prvRepo.findById.mockResolvedValue(mockProvider as never);
    notifyClient.mockResolvedValue(undefined);
    notifyProvider.mockRejectedValue(new Error("SMTP indisponível"));

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      "SMTP indisponível",
    );
  });

  it("deve lançar ConflictError quando serviço está inativo", async () => {
    svcRepo.findById.mockResolvedValue({
      ...mockService,
      isActive: false,
    } as never);

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      ConflictError,
    );
    await expect(createAppointment(10, createInput)).rejects.toThrow(
      "O serviço informado está inativo.",
    );
  });

  it("deve lançar ConflictError quando horário não cabe no schedule do prestador", async () => {
    svcRepo.findById.mockResolvedValue(mockService as never);
    schRepo.findByProviderId.mockResolvedValue([
      { ...mockSchedule, startTime: "10:00", endTime: "17:00" },
    ] as never);

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      ConflictError,
    );
    expect(aptRepo.create).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando duração do serviço ultrapassa o fim do turno", async () => {
    svcRepo.findById.mockResolvedValue({
      ...mockService,
      durationMinutes: 45,
    } as never);
    schRepo.findByProviderId.mockResolvedValue([
      { ...mockSchedule, startTime: "09:00", endTime: "09:30" },
    ] as never);

    await expect(
      createAppointment(10, { ...createInput, startTime: "09:00" }),
    ).rejects.toThrow(ConflictError);
  });

  it("deve lançar ConflictError quando já existe agendamento sobreposto", async () => {
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

    await expect(createAppointment(10, createInput)).rejects.toThrow(
      ConflictError,
    );
    await expect(createAppointment(10, createInput)).rejects.toThrow(
      "Já existe um agendamento para o intervalo informado.",
    );
    expect(aptRepo.create).not.toHaveBeenCalled();
  });
});

describe("listAppointmentsByProvider", () => {
  it("deve listar agendamentos do prestador", async () => {
    prvRepo.findById.mockResolvedValue(mockProvider as never);
    aptRepo.findByProviderId.mockResolvedValue([mockAppointment] as never);

    const result = await listAppointmentsByProvider(1);

    expect(prvRepo.findById).toHaveBeenCalledWith(1);
    expect(aptRepo.findByProviderId).toHaveBeenCalledWith(1);
    expect(result).toEqual([
      {
        ...mockAppointment,
        appointmentDate: "2026-05-11",
      },
    ]);
  });

  it("deve lançar NotFoundError quando prestador não existe", async () => {
    prvRepo.findById.mockResolvedValue(null as never);

    await expect(listAppointmentsByProvider(999)).rejects.toThrow(
      NotFoundError,
    );
    expect(aptRepo.findByProviderId).not.toHaveBeenCalled();
  });
});

describe("getAppointmentById", () => {
  it("deve retornar agendamento por id", async () => {
    aptRepo.findById.mockResolvedValue(mockAppointment as never);

    const result = await getAppointmentById(1);

    expect(result).toEqual({
      ...mockAppointment,
      appointmentDate: "2026-05-11",
    });
  });

  it("deve lançar NotFoundError quando agendamento não existe", async () => {
    aptRepo.findById.mockResolvedValue(null as never);

    await expect(getAppointmentById(999)).rejects.toThrow(NotFoundError);
  });
});

describe("updateAppointmentStatus", () => {
  it("deve atualizar status de agendamento scheduled", async () => {
    const updated = { ...mockAppointment, status: AppointmentStatus.completed };
    aptRepo.findById.mockResolvedValue(mockAppointment as never);
    aptRepo.updateStatus.mockResolvedValue(updated as never);

    const result = await updateAppointmentStatus(1, { status: "completed" });

    expect(aptRepo.updateStatus).toHaveBeenCalledWith(1, {
      status: "completed",
    });
    expect(result).toEqual({
      ...updated,
      appointmentDate: "2026-05-11",
    });
  });

  it("deve lançar NotFoundError quando agendamento não existe", async () => {
    aptRepo.findById.mockResolvedValue(null as never);

    await expect(
      updateAppointmentStatus(999, { status: "completed" }),
    ).rejects.toThrow(NotFoundError);
    expect(aptRepo.updateStatus).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError quando agendamento já está finalizado", async () => {
    aptRepo.findById.mockResolvedValue({
      ...mockAppointment,
      status: AppointmentStatus.canceled,
    } as never);

    await expect(
      updateAppointmentStatus(1, { status: "completed" }),
    ).rejects.toThrow(ConflictError);
    expect(aptRepo.updateStatus).not.toHaveBeenCalled();
  });
});
