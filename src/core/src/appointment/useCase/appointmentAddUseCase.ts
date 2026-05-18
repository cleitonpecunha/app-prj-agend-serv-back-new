import { ISchedulesRepository } from "../../schedule/repositories/ISchedulesRepository";
import { IServicesRepository } from "../../service/repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { IAppointmentAddRequestDTO } from "../dto/appointmentDTO";
import Appointment from "../model/appointment";
import { MensagensPadronizadas } from "../../shared/mensagensPadronizadas";
import { ConflictError, NotFoundError } from "@/lib/errors";
import {
  getDayOfWeek,
  hasAppointmentConflict,
  intervalFitsSchedule,
  parseTimeToMinutes,
  toAppointmentDate,
  validateDate,
} from "../../shared/libs";
import { IMailProvider } from "../../shared/providerEmail/IMailProvider";
import { buildMailAppointmentRegisterInfo } from "../../shared/templateEmail/MailAppointmentRegisterInfo";
import { env } from "@/config/env";

export class AppointmentAddUseCase {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
    private readonly serviceRepository: IServicesRepository,
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly userRepository: IUsersRepository,
    private readonly mailProvider: IMailProvider,
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

    const mailAppointmentRegisterInfo = buildMailAppointmentRegisterInfo({
      clientName: data.clientName,
      serviceName: existingService.name!,
      userBusinessName: existingUser.businessName!,
      appointmentDate: data.appointmentDate.toString(),
      startTime: data.startTime,
    });

    await this.mailProvider.sendMail({
      to: {
        name: data.clientName,
        email: data.clientEmail,
      },
      from: {
        name: env.MAIL_FROM_NAME,
        email: env.MAIL_FROM_EMAIL,
      },
      subject: mailAppointmentRegisterInfo.subject,
      body: mailAppointmentRegisterInfo.html,
    });
  }
}
