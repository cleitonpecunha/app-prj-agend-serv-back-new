import { formatDate } from "../../shared/libs";
import { IAppointmentMailRegisterConfirmationDTO } from "../dto/appointmentDTO";

export function buildMailAppointmentRegisterInfo(
  data: IAppointmentMailRegisterConfirmationDTO,
) {
  const formattedDate = formatDate(data.appointmentDate);

  const subject = `Agendamento confirmado – ${data.serviceName}`;

  const text = [
    `Olá, ${data.clientName}!`,
    "",
    "Seu agendamento foi confirmado com sucesso.",
    "",
    `Serviço: ${data.serviceName}`,
    `Estabelecimento: ${data.userBusinessName}`,
    `Data: ${formattedDate}`,
    `Horário: ${data.startTime}`,
    "",
    "Se precisar cancelar ou remarcar, entre em contato com o estabelecimento.",
    "",
    "Até breve!",
    "Equipe Suporte Meu App",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Agendamento confirmado</title></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#2563eb">Agendamento confirmado!</h2>
  <p>Olá, <strong>${data.clientName}</strong>!</p>
  <p>Seu agendamento foi confirmado com sucesso. Veja os detalhes abaixo:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Serviço</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.serviceName}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Estabelecimento</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.userBusinessName}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Data</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${formattedDate}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Horário</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.startTime}</td>
    </tr>
  </table>
  <p style="color:#6b7280;font-size:14px">Se precisar cancelar ou remarcar, entre em contato com o estabelecimento.</p>
  <p>Até breve!<br /><strong>Equipe Suporte Meu App</strong></p>
</body>
</html>
`.trim();

  return { subject, text, html };
}
