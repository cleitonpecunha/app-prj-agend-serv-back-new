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

| Variável                  | Descrição                                  |
| ------------------------- | ------------------------------------------ |
| `PORT`                    | Porta da API (padrão: `3333`)              |
| `DATABASE_URL`            | URL de conexão PostgreSQL                  |
| `JWT_SECRET`              | Segredo para o access token                |
| `JWT_REFRESH_SECRET`      | Segredo para o refresh token               |
| `MAIL_ENABLED`            | Habilita envio de e-mails (`true`/`false`) |
| `SMTP_HOST`               | Host do servidor SMTP                      |
| `SMTP_USER` / `SMTP_PASS` | Credenciais SMTP                           |

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
| `POST`   | `/api/user`                             | PU  | Cadastrar o usuário prestador    | DONE     |
| `GET`    | `/api/user/:id`                         | PR  | Buscar usuário                   | DONE     |
| `PUT`    | `/api/user/:id`                         | PR  | Atualizar usuário                | DONE     |
| `DELETE` | `/api/user/:id`                         | PR  | Remover usuário                  | DONE     |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/auth/login`                       | PU  | Login do usuário prestador       | DONE     |
| `POST`   | `/api/auth/refresh`                     | XX  | Renovação do access token        | TO DO    |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `GET`    | `/api/providers/:id/dashboard`          | XX  | Dashboard com métricas           | TO DO    |
| `GET`    | `/api/providers/:id/revenue`            | XX  | Relatório de receita             | TO DO    |
| `GET`    | `/api/providers/:id/schedules`          | XX  | Listar horários do prestador     | TO DO    |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/services`                         | PR  | Criar serviço                    | DONE     |
| `GET`    | `/api/services/:id`                     | PR  | Buscar serviço                   | DONE     |
| `PUT`    | `/api/services/:id`                     | PR  | Atualizar serviço                | DONE     |
| `DELETE` | `/api/services/:id`                     | PR  | Remover serviço                  | DONE     |
| `GET`    | `/api/services`                         | PR  | Listar todos os serviços         | DONE     |
| `GET`    | `/api/services/:userId/services`        | PU  | Listar serviços de um prestador  | DONE     |
| `GET`    | `/api/services/:id/appointments`        | XX  | Agendamentos de um serviço       | TO DO    |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/schedules`                        | PR  | Criar horário de atendimento     | DONE     |
| `GET`    | `/api/schedules/:userId/schedules`      | PU  | Listar horarios de um prestador  | DONE     |
| `GET`    | `/api/schedules/:id`                    | PR  | Buscar horário                   | DONE     |
| `PUT`    | `/api/schedules/:id`                    | PR  | Atualizar horário                | DONE     |
| `DELETE` | `/api/schedules/:id`                    | PR  | Remover horário                  | DONE     |
| -------- | --------------------------------------- | --  | -------------------------------- | -------- |
| `POST`   | `/api/services/:serviceId/appointments` | PU  | Criar agendamento                | DONE     |
| `GET`    | `/api/users/appointments`               | PR  | Listar agendamentos do prestador | DONE     |
| `GET`    | `/api/appointments/:id`                 | PR  | Buscar agendamento               | TO DO    |
| `PATCH`  | `/api/appointments/:id/status`          | PR  | Atualizar status do agendamento  | TO DO    |
| `DELETE` | `/api/appointments/:id`                 | PR  | Remover agendamento              | TO DO    |

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
│   ├── routes.ts            # Registro de todas as rotas
│   └── controllers/         # Controllers por domínio
│       ├── auth/
│       ├── appointments/
│       ├── providers/
│       ├── services/
│       └── schedules/
├── config/
│   └── env.ts               # Variáveis de ambiente validadas com Zod
|── core/
│   └── src/                 # definir
│       ├── auth/            # autenticação de usuário
|       |   ├── controller   # definir
|       |   ├── dto          # definir
|       |   ├── model        # definir
|       |   ├── provider     # definir
|       |   ├── useCase      # definir
|       |   ├── routes.ts    # definir
|       |   ├── schema.ts    # definir
|       ├── error            # definir
|       ├── shared           # componentes compartilhados
|       ├── user/            # usuários
|       |   ├── controller   # definir
|       |   ├── dto          # definir
|       |   ├── model        # definir
|       |   ├── provider     # definir
|       |   ├── repositories # definir
|       |   ├── useCase      # definir
|       |   ├── routes.ts    # definir
|       |   ├── schema.ts    # definir
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
