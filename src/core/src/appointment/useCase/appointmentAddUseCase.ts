import { ISchedulesRepository } from "../../schedule/repositories/ISchedulesRepository";
import { IServicesRepository } from "../../service/repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import {
  IAppointmentAddRequestDTO,
  IAppointmentServiceResponseDTO,
} from "../dto/appointmentDTO";
import { IScheduleResponseDTO } from "../../schedule/dto/scheduleDTO";
import Appointment from "../model/appointment";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { dayOfWeek } from "../../shared/dayOfWeek";

function toAppointmentDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function getDayOfWeek(date: Date) {
  return dayOfWeek[date.getUTCDay()];
}

function parseTimeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateDate(data: string, hora: string): boolean {
  const appointmentDateTime = toAppointmentDate(data);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return false;
  }

  const [hours, minutes] = hora.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  appointmentDateTime.setUTCHours(hours!, minutes, 0, 0);
  return appointmentDateTime.getTime() < Date.now();
}

function intervalFitsSchedule(
  schedules: IScheduleResponseDTO[],
  appointmentDayOfWeek: string,
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return schedules.some((schedules) => {
    if (schedules.dayOfWeek !== appointmentDayOfWeek) {
      return false;
    }

    const scheduleStartMinutes = parseTimeToMinutes(schedules.startTime);
    const scheduleEndMinutes = parseTimeToMinutes(schedules.endTime);

    return (
      scheduleStartMinutes <= requestedStartMinutes &&
      scheduleEndMinutes >= requestedEndMinutes
    );
  });
}

function hasAppointmentConflict(
  existingAppointments: IAppointmentServiceResponseDTO[],
  requestedStartMinutes: number,
  requestedEndMinutes: number,
) {
  return existingAppointments.some((appointment) => {
    const existingStartMinutes = parseTimeToMinutes(appointment.startTime);
    const existingEndMinutes =
      existingStartMinutes + appointment.service.durationMinutes;

    return (
      existingStartMinutes < requestedEndMinutes &&
      existingEndMinutes > requestedStartMinutes
    );
  });
}

export class AppointmentAddUseCase {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
    private readonly serviceRepository: IServicesRepository,
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly userRepository: IUsersRepository,
  ) {}

  async execute(
    idService: string,
    data: IAppointmentAddRequestDTO,
  ): Promise<void> {
    // Busca o serviço indicado para atendimento
    const [existingService] = await Promise.all([
      this.serviceRepository.findById(idService),
    ]);

    // Se o serviço não existir, lançar um erro
    if (!existingService) {
      throw new NotFoundError(MensagensPadronizadas.SERVICO_NAO_ENCONTRADO);
    }

    if (!existingService.isActive) {
      throw new ConflictError(MensagensPadronizadas.SERVICO_INATIVO);
    }

    // Busca e validar o usuário/prestador do serviço agendado
    const [existingUser] = await Promise.all([
      this.userRepository.findById(existingService.userId!),
    ]);

    // Se o usuário não existir, lançar um erro
    if (!existingUser) {
      throw new NotFoundError(MensagensPadronizadas.USUARIO_NAO_ENCONTRADO);
    }

    const appointmentDate = toAppointmentDate(data.appointmentDate.toString());
    const appointmentDayOfWeek = getDayOfWeek(appointmentDate);
    const requestedStartMinutes = parseTimeToMinutes(data.startTime);
    const requestedEndMinutes =
      requestedStartMinutes + existingService.durationMinutes!;

    if (validateDate(data.appointmentDate.toString(), data.startTime)) {
      throw new ConflictError(
        MensagensPadronizadas.AGENDA_DATA_HORARIO_INVALIDO,
      );
    }

    // Buscar os horários de atendimento do usuário/prestador do serviço agendado
    const [existingSchedules] = await Promise.all([
      this.schedulesRepository.findByManyUserId(existingService.userId!),
    ]);

    // Se o horário solicitado não estiver dentro da disponibilidade do prestador, lançar um erro
    if (
      requestedEndMinutes > 24 * 60 ||
      !intervalFitsSchedule(
        existingSchedules,
        appointmentDayOfWeek!,
        requestedStartMinutes,
        requestedEndMinutes,
      )
    ) {
      throw new ConflictError(
        MensagensPadronizadas.AGENDA_HORARIO_INDISPONIVEL,
      );
    }

    // Buscar se existem horários ja agendados de atendimento do usuário/prestador do serviço agendado na data/hora solicitada
    const [existingAppointments] = await Promise.all([
      this.appointmentsRepository.findManyByUserIdAndDate(
        existingService.userId!,
        appointmentDate,
      ),
    ]);

    // Se existir um horário de atendimento já agendado para o intervalo solicitado, lançar um erro
    if (
      hasAppointmentConflict(
        existingAppointments,
        requestedStartMinutes,
        requestedEndMinutes,
      )
    ) {
      throw new ConflictError(MensagensPadronizadas.AGENDA_CONFLITO);
    }
    //console.log("Dados recebidos para criação do serviço:", data);

    // Criar a instância do appointment e salvar no repositório
    const appointment = new Appointment({
      ...data,
      userId: existingUser.id!,
      serviceId: existingService.id!,
      appointmentDate: appointmentDate,
      notes: data.notes || null,
    });

    // Salvar o appointment no repositório
    await this.appointmentsRepository.save(appointment);
  }
}
