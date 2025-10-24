# Access Control API

API RESTful simples para controle de acesso de usuários, construída com Node.js (18+), NestJS, TypeORM e PostgreSQL. A API implementa autenticação via JWT, perfis de acesso (admin e user), e registro de logs de acesso a cada login.

## Visão Geral
- Cadastro de usuários: id, nome, email, senha (hash), perfil (admin, user)
- Autenticação: endpoint de login que retorna um JWT válido
- Controle de acesso: apenas administradores podem listar todos os usuários
- Logs de acesso: cada login registra data/hora, usuário e IP em tabela separada
- Documentação com Swagger em /docs

## Tecnologias
- Node.js 18+
- NestJS 11
- TypeORM 0.3 (PostgreSQL)
- JWT (passport-jwt)
- Docker e Docker Compose
- Jest (unit e e2e)

## Arquitetura
- Estrutura modular seguindo princípios de DDD/Clean Architecture
- Módulos principais: Auth, Users, Access Log
- Validações com Class Validator e pipes globais

## Requisitos
- Node.js 18+
- pnpm (recomendado)
- PostgreSQL (local ou via Docker)
- Docker e Docker Compose (opcional, recomendado)

## Configuração
Crie um arquivo .env na raiz do projeto com as variáveis abaixo:
```
PORT=3000
# JWT
JWT_SECRET=uma_chave_segura
JWT_EXPIRES_IN=24h
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASS=app
DB_NAME=access_control
```

## Executando com Docker (recomendado)
1. Suba os serviços:
   - `docker-compose up -d`
2. Garanta que seu .env utiliza as mesmas credenciais do docker-compose (user=app, pass=app, db=access_control)
3. Instale dependências:
   - `pnpm install`
4. Popule o banco com o seed:
   - `pnpm run seed:admin`
5. Inicie a API:
   - `pnpm start:dev`
6. Swagger: acesse `http://localhost:3000/docs`

Opcionais no docker-compose:
- Redis (porta 6379) para cache de autenticação
- RabbitMQ (portas 5672/15672) para mensageria simples

## Executando localmente (sem Docker)
1. Crie o banco PostgreSQL e um usuário com permissões
2. Ajuste seu .env com as credenciais locais
3. Instale dependências: `pnpm install`
4. Inicie a API: `pnpm start:dev`
5. Swagger: `http://localhost:3000/docs`

Observação: o TypeORM está configurado com `synchronize=false`. Execute suas migrações se disponíveis e/ou garanta que o esquema de tabelas esteja criado.

## Comandos úteis
- `pnpm start:dev` — inicia em modo desenvolvimento
- `pnpm run seed:admin` — cria um usuário admin com email `admin@example.com` e senha `123456`
- `pnpm build` — compila para produção
- `pnpm start:prod` — inicia o build compilado
- `pnpm test` — testes unitários
- `pnpm test:e2e` — testes de ponta-a-ponta

## Endpoints principais
- POST `/auth/login`
  - Body: `{ email, password }`
  - Retorna: `{ access_token, user }`
- GET `/users/me` (JWT)
  - Retorna dados do usuário atual (sem hash de senha)
- GET `/users` (JWT, role=admin)
  - Lista todos os usuários
- POST `/users` (JWT, role=admin)
  - Cria um novo usuário
- GET `/access-logs` (JWT, role=admin)
  - Lista logs de acesso

Autorização: adicionar `Authorization: Bearer <token>`.

## Logs de Acesso
- Registrados automaticamente no login
- Captura IP via `x-forwarded-for`, `req.ip` ou `remoteAddress`

## Testes
- Unitários: `pnpm test`
- E2E: `pnpm test:e2e`
  - Há um setup de ambiente em `test/setup.ts` que define variáveis de teste
- Suites específicas:
  - `pnpm test:e2e:auth`
  - `pnpm test:e2e:users`
  - `pnpm test:e2e:logs`
  - `pnpm test:e2e:integration`

## CI
- Pipeline simples com GitHub Actions em `.github/workflows/ci.yml`

## Diferenciais (opcionais)
- Redis para cache de autenticação
- RabbitMQ para mensageria de auditoria
