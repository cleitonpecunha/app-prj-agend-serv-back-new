import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { AppointmentStatus } from "@/generated/prisma/enums";
import {
  hasAppointmentConflict,
  intervalFitsSchedule,
  validateDate,
} from "../../shared/libs";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";

export class AppointmentServices {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
  ) {}

  // Método que valida se o status atual do agendamento for diferente de "scheduled" que pode ser alterado
  async validarPermiteAtualizarStatus(status: string) {
    if (status !== AppointmentStatus.scheduled) {
      throw new ConflictError(
        MensagensPadronizadas.AGENDAMENTO_STATUS_INVALIDO,
      );
    }
  }

  // Método que valida se o novo status é "scheduled", o que não é permitido
  async validarNovoStatusParaAtualizacao(status: string) {
    if (status === AppointmentStatus.scheduled) {
      throw new AppError(
        MensagensPadronizadas.AGENDAMENTO_STATUS_INVALIDO_PARA_ATUALIZACAO,
        422,
      );
    }
  }

  // Método que valida a data e horário do agendamento
  async validarDataHorarioAgendamento(data: string, hora: string) {
    if (validateDate(data, hora)) {
      throw new ConflictError(
        MensagensPadronizadas.AGENDA_DATA_HORARIO_INVALIDO,
      );
    }
  }

  // Método que valida se o horário solicitado não estiver dentro da disponibilidade do prestador
  async validarDisponibilidadeHorarioAgendamento(
    existingSchedules: any,
    appointmentDayOfWeek: any,
    requestedStartMinutes: number,
    requestedEndMinutes: number,
  ) {
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
  }

  // Método que valida se existe um horário de atendimento já agendado para o intervalo solicitado
  async validarConflitoHorarioAgendamento(
    existingAppointments: any,
    requestedStartMinutes: number,
    requestedEndMinutes: number,
  ) {
    if (
      hasAppointmentConflict(
        existingAppointments,
        requestedStartMinutes,
        requestedEndMinutes,
      )
    ) {
      throw new ConflictError(MensagensPadronizadas.AGENDA_CONFLITO);
    }
  }

  // Método para buscar um agendamento por ID e UserID
  async buscarAgendamentoPorIdUserId(id: string, userId: string) {
    const existAppointment = await this.appointmentsRepository.findByIdUserId(
      id,
      userId,
    );

    if (!existAppointment) {
      throw new NotFoundError(MensagensPadronizadas.AGENDAMENTO_NAO_ENCONTRADO);
    }

    return existAppointment;
  }

  // Método para buscar todos os agendamentos de um usuário
  async buscarTodosAgendamentosPorUserId(userId: string) {
    const existAppointments =
      await this.appointmentsRepository.findByManyUserId(userId);

    if (!existAppointments || existAppointments.length === 0) {
      throw new NotFoundError(
        MensagensPadronizadas.AGENDAMENTOS_NAO_ENCONTRADOS,
      );
    }

    return existAppointments;
  }

  // Método para verificar se existem horários já agendados de atendimento do usuário/prestador do serviço agendado na data/hora solicitada
  async buscarAgendamentosPorUserIdEData(
    userId: string,
    appointmentDate: Date,
  ) {
    const existAppointments =
      await this.appointmentsRepository.findManyByUserIdAndDate(
        userId,
        appointmentDate,
      );

    /* if (!existAppointments || existAppointments.length === 0) {
      throw new NotFoundError(
        MensagensPadronizadas.AGENDAMENTOS_NAO_ENCONTRADOS,
      );
    } */

    return existAppointments;
  }
}
