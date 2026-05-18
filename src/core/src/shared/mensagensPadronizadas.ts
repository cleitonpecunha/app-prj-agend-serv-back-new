export enum MensagensPadronizadas {
  SERVICO_NAO_ENCONTRADO = "Serviço não encontrado.",
  SERVICOS_NAO_ENCONTRADOS = "Não existem serviços cadastrados para serem apresentados.",
  SERVICO_COM_AGENDAMENTOS = "Não é possível remover um serviço com agendamentos vinculados.",
  SERVICO_INATIVO = "O serviço informado está inativo.",

  HORARIO_JA_CADASTRADO = "Já existe um horário cadastrado que conflita com o intervalo informado.",
  HORARIO_NAO_ENCONTRADO = "Horário não encontrado.",
  HORARIOS_NAO_ENCONTRADOS = "Não existem horários cadastrados para serem apresentados.",
  HORARIO_COM_AGENDAMENTOS = "Não é possível remover um horário com agendamentos vinculados.",

  USUARIO_NAO_ENCONTRADO = "Não existe usuário/prestador cadastrado.",
  USUARIOS_NAO_ENCONTRADOS = "Não existem usuários/prestadores cadastrados para serem apresentados.",
  USUARIO_EMAIL_JA_CADASTRADO = "Já existe um usuário/prestador cadastrado com este e-mail.",
  USUARIO_NOME_NEGOCIO_JA_CADASTRADO = "Já existe um usuário/prestador cadastrado com este nome de negócio.",

  AGENDA_HORARIO_INDISPONIVEL = "O horário solicitado não está dentro da disponibilidade do prestador.",
  AGENDA_CONFLITO = "Já existe um agendamento para o intervalo informado.",
  AGENDA_DATA_HORARIO_INVALIDO = "Data ou horário inválido para agendamento.",
  AGENDAMENTO_NAO_ENCONTRADO = "Agendamento não encontrado.",
  AGENDAMENTOS_NAO_ENCONTRADOS = "Não existem agendamentos cadastrados para serem apresentados.",
  AGENDAMENTO_STATUS_INVALIDO = "O status do agendamento não pode mais ser alterado.",
  AGENDAMENTO_STATUS_INVALIDO_PARA_ATUALIZACAO = "Status inválido para atualização.",

  UNAUTHORIZED_ERROR = "Este usuário/prestador não está autorizado.",
  FORBIDDEN_ERROR = "Este usuário/prestador não tem permissão para acessar este recurso.",
  NOT_FOUND_ERROR = "Registro não encontrado.",
  TOKEN_EXPIRED_ERROR = "O token expirou. Faça login novamente.",
  TOKEN_INVALIDO = "Token inválido.",
  CREDENCIAIS_INVALIDAS = "Credenciais inválidas.",
}
