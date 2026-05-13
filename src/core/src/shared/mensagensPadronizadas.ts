export enum MensagensPadronizadas {
  SERVICO_NAO_ENCONTRADO = "Serviço não encontrado.",
  SERVICO_COM_AGENDAMENTOS = "Não é possível remover um serviço com agendamentos vinculados.",
  SERVICOS_NAO_ENCONTRADOS = "Não existem serviços cadastrados para serem apresentados.",

  HORARIO_NAO_ENCONTRADO = "Horário não encontrado.",
  HORARIO_COM_AGENDAMENTOS = "Não é possível remover um horário com agendamentos vinculados.",
  HORARIOS_NAO_ENCONTRADOS = "Não existem horários cadastrados para serem apresentados.",
  HORARIO_JA_CADASTRADO = "Já existe um horário cadastrado que conflita com o intervalo informado.",

  USUARIO_NAO_ENCONTRADO = "Não existe usuário/prestador cadastrado.",
  USUARIOS_NAO_ENCONTRADOS = "Não existem usuários/prestadores cadastrados para serem apresentados.",
  USUARIO_EMAIL_JA_CADASTRADO = "Já existe um usuário/prestador cadastrado com este e-mail.",
  USUARIO_NOME_NEGOCIO_JA_CADASTRADO = "Já existe um usuário/prestador cadastrado com este nome de negócio.",

  UNAUTHORIZED_ERROR = "Este usuário/prestador não está autorizado.",
  FORBIDDEN_ERROR = "Este usuário/prestador não tem permissão para acessar este recurso.",
  NOT_FOUND_ERROR = "Registro não encontrado.",
  TOKEN_EXPIRED_ERROR = "O token expirou. Faça login novamente.",
  CREDENCIAIS_INVALIDAS = "Credenciais inválidas.",
}
