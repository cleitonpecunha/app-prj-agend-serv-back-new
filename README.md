# AgendServiços — API Backend

API REST para agendamento de serviços, construída com **Fastify**, **Prisma** e **PostgreSQL**. Permite que prestadores de serviço gerenciem seus serviços, horários de atendimento e agendamentos de clientes, com notificações por e-mail integradas.

---

## Recursos

- **Autenticação JWT** — login com access token (15 min) e refresh token (7 dias)
- **Gestão de prestadores** — cadastro, atualização, exclusão e dashboard com métricas
- **Serviços** — CRUD completo de serviços por prestador (nome, descrição, duração, preço)
- **Horários de atendimento** — configuração de dias da semana e janelas de horário
- **Agendamentos** — criação e atualização de status (`scheduled`, `completed`, `canceled`, `no_show`)
- **Receita** — endpoint de relatório de receita por período
- **Notificações por e-mail** — confirmação para o cliente e notificação para o prestador via SMTP (Mailtrap compatível)
- **Validação de dados** — schemas com Zod em todas as rotas
- **Documentação OpenAPI** — especificação completa em `docs/openapi/openapi.yaml`

---

## Tecnologias

| Camada         | Tecnologia                                             |
| -------------- | ------------------------------------------------------ |
| Framework HTTP | [Fastify 5](https://fastify.dev/)                      |
| ORM            | [Prisma 7](https://www.prisma.io/)                     |
| Banco de dados | PostgreSQL 15                                          |
| Autenticação   | [@fastify/jwt](https://github.com/fastify/fastify-jwt) |
| Validação      | [Zod 4](https://zod.dev/)                              |
| E-mail         | [Nodemailer](https://nodemailer.com/)                  |
| Linguagem      | TypeScript 5                                           |
| Testes         | Jest                                                   |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) e Docker Compose (para o banco de dados)

---

## Como executar

### 1. Clone o repositório e instale as dependências

```bash
git clone <url-do-repositorio>
cd app-prj-agend-serv-back-new
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp env.example .env
```

Variáveis principais:

| Variável                  | Descrição                                            |
| ------------------------- | ---------------------------------------------------- |
| `PORT`                    | Porta da API (padrão: `3333`)                        |
| `DATABASE_URL`            | URL de conexão PostgreSQL                            |
| `JWT_SECRET`              | Segredo para o access token                          |
| `JWT_REFRESH_SECRET`      | Segredo para o refresh token                         |
| `JWT_ACCESS_EXPIRES_IN`   | Tempo de expiração do access token                   |
| `JWT_REFRESH_EXPIRES_IN`  | Tempo de expiração do refresh token                  |
| `MAIL_FROM_NAME`          | Nome padrão para envio de e-mail                     |
| `MAIL_FROM_EMAIL`         | E-Mail padrão para envio de e-mail                   |
| `MAIL_ENABLED`            | Habilita envio de e-mails (`true`/`false`)           |
| `SMTP_HOST`               | Host do servidor SMTP                                |
| `SMTP_PORT`               | Port do servidor SMTP                                |
| `SMTP_SECURE`             | Habilita segurança do servidor SMTP (`true`/`false`) |
| `SMTP_USER` / `SMTP_PASS` | Credenciais SMTP                                     |
| `SMTP_FROM_NAME`          | Nome padrão para envio de e-mail                     |
| `SMTP_FROM_EMAIL`         | E-Mail padrão para envio de e-mail                   |

> Para gerar segredos JWT seguros: `openssl rand -hex 64`

### 3. Suba o banco de dados com Docker

```bash
docker compose up -d
```

### 5. Execute o generate do Prisma

```bash
npx prisma generate
```

### 6. Execute as migrations do Prisma

```bash
npx prisma migrate deploy
```

### 5. Inicie o servidor

**Modo desenvolvimento (com hot reload):**

```bash
npm run dev
```

**Modo produção:**

```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3333`.

---

## Rotas da API

Todas as rotas estão prefixadas em `/api`.

| Método   | Rota de API                             | TP  | Descrição do que faz a rota      | Status   |
| -------- | --------------------------------------- | --- | -------------------------------- | -------- |
| `GET`    | `/api/ping`                             | PU  | Health check                     | DONE     |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/user`                             | PU  | Add usuário/prestador            | DONE     |
| `PUT`    | `/api/user`                             | PR  | Atualizar                        | DONE     |
| `DELETE` | `/api/user`                             | PR  | Remover                          | DONE     |
| `GET`    | `/api/user`                             | PR  | Buscar                           | DONE     |
| `GET`    | `/api/user/todos`                       | PU  | Listar todos                     | DONE     |
| `GET`    | `/api/user/:userId/services`            | PU  | Listar serviços                  | DONE     |
| `GET`    | `/api/user/:userId/schedules`           | PU  | Listar horarios de atendimento   | DONE     |
| `GET`    | `/api/users/dashboard`                  | PR  | Dashboard de agendamentos        | DONE     |
| `GET`    | `/api/users/revenue`                    | PR  | Receitas de agendamentos         | DONE     |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/auth/login`                       | PU  | Login usuário/prestador          | DONE     |
| `POST`   | `/api/auth/refresh`                     | XX  | Renovação do access token        | TO DO    |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/services`                         | PR  | Criar serviço                    | DONE     |
| `PUT`    | `/api/services/:id`                     | PR  | Atualizar                        | DONE     |
| `DELETE` | `/api/services/:id`                     | PR  | Remover                          | DONE     |
| `GET`    | `/api/services/:id`                     | PR  | Buscar                           | DONE     |
| `GET`    | `/api/services`                         | PR  | Listar todos os serviços         | DONE     |
| `POST`   | `/api/services/:serviceId/appointments` | PU  | Criar agendamento                | DONE     |
| `GET`    | `/api/services/:idService/appointments` | XX  | Listar serviços agendados        | TO DO    |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/schedules`                        | PR  | Criar horário de atendimento     | DONE     |
| `PUT`    | `/api/schedules/:id`                    | PR  | Atualizar                        | DONE     |
| `DELETE` | `/api/schedules/:id`                    | PR  | Remover                          | DONE     |
| `GET`    | `/api/schedules/:id`                    | PR  | Buscar                           | DONE     |
| `GET`    | `/api/schedules`                        | PR  | Listar horarios do prestador     | DONE     |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `PATCH`  | `/api/appointments/:id/status`          | PR  | Atualizar status                 | DONE     |
| `DELETE` | `/api/appointments/:id`                 | PR  | Remover                          | DONE     |
| `GET`    | `/api/appointments/:id`                 | PR  | Buscar agendamento               | DONE     |
| `GET`    | `/api/appointments`                     | PR  | Listar agendamentos do prestador | DONE     |

TP (Tipo de visuaização da rota):

| Tipo | Descrição           |
| ---- | ------------------- |
| `PU` | Pública (Sem Token) |
| `PR` | Privada (Com token) |

Consulte a documentação completa em [`docs/openapi/openapi.yaml`](docs/openapi/openapi.yaml) ou utilize os arquivos `.http` na pasta [`http/`](http/).

---

## Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

---

## Estrutura do projeto

```
src/
├── app.ts                   # Configuração do Fastify (plugins, rotas)
├── server.ts                # Ponto de entrada
├── api/
│   ├── ping/                # Tested e api conm acesso ao banco de dados
│   ├── routes.ts            # Registro de todas as rotas dos domínios
├── config/
│   └── env.ts               # Variáveis de ambiente validadas com Zod
|── core/                    # core da aplicação (backend)
│   └── src/
│       ├── appointment/     # referente ao endpoit do domínio de "agendamentos de serviços/horário"
|       |   ├── controller
|       |   ├── dto
|       |   ├── model
|       |   ├── repositories
|       |   ├── useCase
|       |   ├── routes.ts    # registro das rotas do domínio
|       |   ├── schema.ts    # Validações do domínio
|       |   |
│       ├── auth/            # referente ao endpoit do domínio de "autenticação"
|       |   ├── controller
|       |   ├── dto
|       |   ├── model
|       |   ├── provider
|       |   ├── services
|       |   ├── useCase
|       |   ├── routes.ts    # registro das rotas do domínio
|       |   ├── schema.ts    # Validações do domínio
|       |   |
|       ├── error
|       |   |
│       ├── schedule/        # referente ao endpoit do domínio de "horários de atendimento do usuário/prestador"
|       |   ├── controller
|       |   ├── dto
|       |   ├── model
|       |   ├── repositories
|       |   ├── useCase
|       |   ├── routes.ts    # registro das rotas do domínio
|       |   ├── schema.ts    # Validações do domínio
|       |   |
│       ├── service/         # referente ao endpoit do domínio de "serviços do usuário/prestador"
|       |   ├── controller
|       |   ├── dto
|       |   ├── model
|       |   ├── repositories
|       |   ├── useCase
|       |   ├── routes.ts    # registro das rotas do domínio
|       |   ├── schema.ts    # Validações do domínio
|       |   |
|       ├── shared/
|       |   ├── providerEmail
|       |   ├── templateEmail
|       |   ├── dayofweek.ts
|       |   ├── dayorder.ts
|       |   ├── libs.ts
|       |   ├── mensagensPadronizadas.ts
|       |   |
|       ├── user/            # referente ao endpoit do domínio de "usuário/prestador"
|       |   ├── controller
|       |   ├── dto
|       |   ├── model
|       |   ├── provider
|       |   ├── repositories
|       |   ├── services
|       |   ├── useCase
|       |   ├── routes.ts    # registro das rotas do domínio
|       |   ├── schema.ts    # Validações do domínio
|       |
│   └── test/                # testes unitários
└── lib/
    ├── auth.ts              # Helpers JWT
    ├── mail.ts              # Cliente de e-mail
    ├── prisma.ts            # Cliente Prisma singleton
    ├── errors.ts            # Erros de domínio
    └── error-handler.ts     # Handler global de erros
prisma/
├── schema.prisma            # Schema do banco de dados
└── migrations/              # Histórico de migrations
```
