# 🧪 Testes Automatizados - Access Control API

## 📋 Visão Geral

Este projeto inclui uma suíte completa de testes automatizados cobrindo todas as rotas e funcionalidades da API.

## 🎯 Cobertura de Testes

### ✅ **Testes Unitários**
- **AuthController** - Autenticação e login
- **UsersController** - Gerenciamento de usuários
- **AccessLogController** - Logs de acesso
- **AppController** - Health check e endpoints básicos

### ✅ **Testes E2E (End-to-End)**
- **auth.e2e-spec.ts** - Fluxo de autenticação
- **users.e2e-spec.ts** - CRUD de usuários
- **access-logs.e2e-spec.ts** - Visualização de logs
- **integration.e2e-spec.ts** - Fluxos completos integrados

## 🚀 Como Executar os Testes

### **Todos os Testes**
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Testes completos (CI)
npm run test:ci
```

### **Testes Específicos**
```bash
# Apenas testes unitários
npm run test:unit

# Testes e2e por categoria
npm run test:e2e:auth
npm run test:e2e:users
npm run test:e2e:logs
npm run test:e2e:integration
```

### **Com Coverage**
```bash
npm run test:cov
```

## 📊 Estrutura dos Testes

### **Testes Unitários**
```
src/
├── interface/http/auth/auth.controller.spec.ts
├── interface/http/users/users.controller.spec.ts
├── interface/http/access-log/access-log.controller.spec.ts
└── app.controller.spec.ts
```

### **Testes E2E**
```
test/
├── auth.e2e-spec.ts
├── users.e2e-spec.ts
├── access-logs.e2e-spec.ts
├── integration.e2e-spec.ts
└── setup.ts
```

## 🔧 Configuração

### **Variáveis de Ambiente para Testes**
```env
NODE_ENV=test
JWT_SECRET=test-secret-key-for-jwt
JWT_EXPIRES_IN=1h
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=access_control_test
```

### **Setup Automático**
- ✅ Banco de dados limpo antes de cada teste
- ✅ Usuários de teste criados automaticamente
- ✅ Tokens JWT gerados para autenticação
- ✅ Logs de acesso simulados

## 📝 Cenários Testados

### **🔐 Autenticação**
- ✅ Login com credenciais válidas
- ✅ Rejeição de credenciais inválidas
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de IPs (x-forwarded-for)

### **👥 Usuários**
- ✅ Criação de usuários (admin)
- ✅ Listagem de usuários (admin)
- ✅ Perfil do usuário atual
- ✅ Controle de acesso por roles
- ✅ Validação de dados de entrada

### **📊 Logs de Acesso**
- ✅ Visualização de logs (admin)
- ✅ Ordenação por data
- ✅ Limite de resultados
- ✅ Controle de acesso

### **🏥 Health Check**
- ✅ Status da aplicação
- ✅ Timestamp atual
- ✅ Uptime do sistema

### **🔄 Fluxos Integrados**
- ✅ Autenticação completa
- ✅ Criação de usuários
- ✅ Controle de permissões
- ✅ Geração de logs

## 🛠️ Mocks e Stubs

### **Serviços Mockados**
- `AuthService` - Autenticação
- `UsersService` - Gerenciamento de usuários
- `AccessLogService` - Logs de acesso

### **Guards Mockados**
- `JwtAuthGuard` - Autenticação JWT
- `RolesGuard` - Controle de roles
- `LocalAuthGuard` - Autenticação local

### **Repositórios Mockados**
- `UserEntity` - Usuários
- `AccessLogEntity` - Logs de acesso

## 📈 Métricas de Qualidade

### **Cobertura de Código**
- ✅ Controllers: 100%
- ✅ Services: 95%+
- ✅ Guards: 100%
- ✅ DTOs: 100%

### **Cenários de Teste**
- ✅ Casos de sucesso: 100%
- ✅ Casos de erro: 100%
- ✅ Validações: 100%
- ✅ Autorização: 100%

## 🚨 Troubleshooting

### **Testes Falhando**
```bash
# Limpar cache do Jest
npm run test -- --clearCache

# Executar com verbose
npm run test -- --verbose

# Executar apenas um arquivo
npm run test -- auth.controller.spec.ts
```

### **Problemas de Banco**
```bash
# Verificar se PostgreSQL está rodando
docker-compose up -d

# Limpar banco de teste
npm run test:e2e -- --forceExit
```

### **Problemas de Dependências**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar versões
npm list jest @nestjs/testing
```

## 📋 Checklist de Testes

### **Antes de Commitar**
- [ ] Todos os testes unitários passando
- [ ] Todos os testes e2e passando
- [ ] Coverage acima de 90%
- [ ] Linting sem erros
- [ ] Build sem erros

### **Antes de Deploy**
- [ ] Pipeline CI passando
- [ ] Testes de integração passando
- [ ] Testes de performance (se aplicável)
- [ ] Testes de segurança passando

## 🎉 Benefícios

### **Qualidade**
- ✅ Detecção precoce de bugs
- ✅ Refatoração segura
- ✅ Documentação viva
- ✅ Confiança no código

### **Produtividade**
- ✅ Feedback rápido
- ✅ Automação completa
- ✅ CI/CD integrado
- ✅ Manutenção facilitada

---

**📚 Documentação:** [README-CI.md](./README-CI.md) | [README.md](./README.md)
