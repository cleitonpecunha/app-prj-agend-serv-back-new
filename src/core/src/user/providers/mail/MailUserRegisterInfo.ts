export interface registerConfirmationData {
  userName: string;
  descriptionBusinessName: string;
}

export function buildMailUserRegisterInfo(data: registerConfirmationData) {
  const subject = `Seja bem-vindo à plataforma – ${data.descriptionBusinessName}`;

  const text = [
    `Olá, ${data.userName}!`,
    "",
    "Seu cadastro na nossa plataforma foi confirmado com sucesso.",
    "",
    "Se precisar cancelar ou remarcar, entre em contato com o estabelecimento.",
    "",
    "Até breve!",
    "Equipe TWAgenda",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Cadastro confirmado</title></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#2563eb">Cadastro confirmado!</h2>
  <p>Olá, <strong>${data.userName}</strong>!</p>
  <p>Seu cadastro na nossa plataforma foi confirmado com sucesso.</p>  
  <p style="color:#6b7280;font-size:14px">Estamos à disposição para qualquer dúvida ou suporte.</p>
  <p>Até breve!<br /><strong>Equipe TWAgenda</strong></p>
</body>
</html>
`.trim();

  return { subject, text, html };
}
