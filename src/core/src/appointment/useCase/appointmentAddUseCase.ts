import { AppointmentServices } from "../services/appointmentServices";
import { buildMailAppointmentRegisterInfo } from "../../shared/templateEmail/MailAppointmentRegisterInfo";
import { env } from "@/config/env";
import {
  getDayOfWeek,
  parseTimeToMinutes,
  toAppointmentDate,
} from "../../shared/libs";
import { IAppointmentAddRequestDTO } from "../dto/appointmentDTO";
import { IAppointmentsRepository } from "../repositories/IAppointmentsRepository";
import { IMailProvider } from "../../shared/providerEmail/IMailProvider";
import { ISchedulesRepository } from "../../schedule/repositories/ISchedulesRepository";
import { IServicesRepository } from "../../service/repositories/IServicesRepository";
import { IUsersRepository } from "../../user/repositories/IUsersRepository";
import { ScheduleServices } from "../../schedule/services/scheduleServices";
import { ServiceServices } from "../../service/services/serviceServices";
import { UserServices } from "../../user/services/userServices";
import Appointment from "../model/appointment";

export class AppointmentAddUseCase {
  constructor(
    private readonly appointmentsRepository: IAppointmentsRepository,
    private readonly servicesRepository: IServicesRepository,
    private readonly schedulesRepository: ISchedulesRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly mailProvider: IMailProvider,
  ) {}

  async execute(
    idService: string,
    data: IAppointmentAddRequestDTO,
  ): Promise<void> {
    // Criar uma instância dos serviços de agendamento
    const appointmentServices = new AppointmentServices(
      this.appointmentsRepository,
    );

    // Criar uma instância dos serviços de agendamento
    const serviceServices = new ServiceServices(this.servicesRepository);

    // Criar uma instância dos serviços de agendamento
    const userServices = new UserServices(this.usersRepository);

    // Criar uma instância dos serviços de agendamento
    const scheduleServices = new ScheduleServices(this.schedulesRepository);

    // Busca e valida o serviço indicado para atendimento
    const existingService = await serviceServices.buscarServicoPorId(idService);

    // Busca e valida o usuário/prestador do serviço agendado
    const existingUser = await userServices.buscarUsuarioPorId(
      existingService.userId!,
    );

    const appointmentDate = toAppointmentDate(data.appointmentDate.toString());
    const appointmentDayOfWeek = getDayOfWeek(appointmentDate);
    const requestedStartMinutes = parseTimeToMinutes(data.startTime);
    const requestedEndMinutes =
      requestedStartMinutes + existingService.durationMinutes!;

    // Validar a data e horário do agendamento
    await appointmentServices.validarDataHorarioAgendamento(
      data.appointmentDate.toString(),
      data.startTime,
    );

    // Buscar os horários de atendimento do usuário/prestador do serviço agendado
    const existingSchedules =
      await scheduleServices.buscarTodosSchedulesPorUserId(
        existingService.userId!,
      );

    // Se o horário solicitado não estiver dentro da disponibilidade do prestador
    await appointmentServices.validarDisponibilidadeHorarioAgendamento(
      existingSchedules,
      appointmentDayOfWeek!,
      requestedStartMinutes,
      requestedEndMinutes,
    );

    // Buscar se existem horários ja agendados de atendimento do usuário/prestador do serviço agendado na data/hora solicitada
    const existingAppointments =
      await appointmentServices.buscarAgendamentosPorUserIdEData(
        existingService.userId!,
        appointmentDate,
      );

    // Se existir um horário de atendimento já agendado para o intervalo solicitado, lançar um erro
    await appointmentServices.validarConflitoHorarioAgendamento(
      existingAppointments,
      requestedStartMinutes,
      requestedEndMinutes,
    );

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
