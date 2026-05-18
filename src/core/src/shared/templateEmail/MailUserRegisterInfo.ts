import { IUserMailRegisterConfirmationDTO } from "../../dto/userDTO";

export function buildMailUserRegisterInfo(
  data: IUserMailRegisterConfirmationDTO,
) {
  const subject = `Seja bem-vindo à plataforma – ${data.descriptionBusinessName}`;

  const text = [
    `Olá, ${data.userName}!`,
    "",
    "Seu cadastro na nossa plataforma foi confirmado com sucesso.",
    "",
    "Agora é necessário cadastrar seus serviços e horários de atendimentopara que os clientes possam agendar.",
    "",
    "Até breve!",
    "Equipe Suporte Meu App",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Cadastro confirmado</title></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#2563eb">Cadastro confirmado!</h2>
  <p>Olá, <strong>${data.userName}</strong>!</p>
  <p>Seu cadastro na nossa plataforma foi confirmado com sucesso.</p>
  <p>Agora é necessário cadastrar seus serviços e horários de atendimento para que os clientes possam agendar.</p>
  <p style="color:#6b7280;font-size:14px">Estamos à disposição para qualquer dúvida ou suporte.</p>
  <p>Até breve!<br /><strong>Equipe Suporte Meu App</strong></p>
</body>
</html>
`.trim();

  return { subject, text, html };
}
