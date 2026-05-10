// Garante que as variáveis de ambiente estejam definidas antes que qualquer
// módulo da aplicação seja carregado pelo Jest (ex.: src/config/env.ts).
// O dotenv/config não sobrescreve variáveis já definidas em process.env.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.PORT = "3333";
process.env.CORS_ORIGIN = "*";
process.env.LOG_LEVEL = "error";
// SMTP – valores fictícios para testes; o transporter não é usado diretamente
// porque o módulo src/lib/mail.ts é mockado nos suites que o consomem.
process.env.SMTP_HOST = "smtp.test.local";
process.env.SMTP_PORT = "587";
process.env.SMTP_SECURE = "false";
process.env.SMTP_USER = "test-user";
process.env.SMTP_PASS = "test-pass";
process.env.SMTP_FROM_EMAIL = "noreply@twagenda.test";
process.env.SMTP_FROM_NAME = "TWAgenda Test";
