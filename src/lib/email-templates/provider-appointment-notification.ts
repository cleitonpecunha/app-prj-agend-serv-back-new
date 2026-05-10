export interface ProviderAppointmentNotificationData {
  providerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  notes?: string | null;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function buildProviderAppointmentNotificationEmail(
  data: ProviderAppointmentNotificationData,
) {
  const formattedDate = formatDate(data.appointmentDate);
  const notesLine = data.notes ? `Observações: ${data.notes}` : null;

  const subject = `Novo agendamento – ${data.clientName} (${formattedDate} ${data.startTime})`;

  const textLines = [
    `Olá, ${data.providerName}!`,
    "",
    "Você tem um novo agendamento:",
    "",
    `Serviço: ${data.serviceName}`,
    `Data: ${formattedDate}`,
    `Horário: ${data.startTime}`,
    "",
    "Dados do cliente:",
    `Nome: ${data.clientName}`,
    `E-mail: ${data.clientEmail}`,
    `Telefone: ${data.clientPhone}`,
    ...(notesLine ? ["", notesLine] : []),
    "",
    "Equipe TWAgenda",
  ];

  const text = textLines.join("\n");

  const notesRow = notesLine
    ? `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Observações</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.notes}</td>
    </tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Novo agendamento</title></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#2563eb">Novo agendamento recebido!</h2>
  <p>Olá, <strong>${data.providerName}</strong>!</p>
  <p>Um novo agendamento foi realizado para você:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Serviço</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.serviceName}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Data</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${formattedDate}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Horário</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.startTime}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Cliente</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.clientName}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">E-mail do cliente</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.clientEmail}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb">Telefone do cliente</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${data.clientPhone}</td>
    </tr>${notesRow}
  </table>
  <p>Equipe TWAgenda</p>
</body>
</html>
`.trim();

  return { subject, text, html };
}
