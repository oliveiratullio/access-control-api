# Pipeline CI/CD - Access Control API

## 🚀 Pipeline de CI/CD

Este projeto inclui uma pipeline completa de CI/CD usando GitHub Actions.

### 📋 O que a Pipeline faz:

#### 1. **Testes** (`test` job)
- ✅ Instala dependências
- ✅ Executa linting (ESLint)
- ✅ Executa testes unitários
- ✅ Executa testes e2e
- ✅ Usa PostgreSQL como serviço

#### 2. **Build** (`build` job)
- ✅ Compila a aplicação
- ✅ Gera artefatos de build
- ✅ Upload dos artefatos

#### 3. **Segurança** (`security` job)
- ✅ Audit de vulnerabilidades (npm audit)
- ✅ Verificação de dependências
- ✅ Análise de segurança

#### 4. **Docker** (`docker` job)
- ✅ Build da imagem Docker
- ✅ Push para Docker Hub
- ✅ Cache otimizado
- ⚠️ **Apenas no branch `main`**

### 🔧 Configuração Necessária

#### Secrets do GitHub:
Para que a pipeline funcione completamente, configure estes secrets no GitHub:

```bash
# Docker Hub
DOCKER_USERNAME=seu-usuario-dockerhub
DOCKER_PASSWORD=sua-senha-dockerhub
```

#### Como configurar:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os secrets acima

### 🐳 Docker

#### Build local:
```bash
npm run docker:build
```

#### Run local:
```bash
npm run docker:run
```

#### Health Check:
A aplicação inclui um endpoint de health check:
```
GET /health
```

### 📊 Triggers da Pipeline

A pipeline é executada quando:
- ✅ Push para `main` ou `develop`
- ✅ Pull Request para `main`
- ✅ Manual trigger

### 🛠️ Scripts Disponíveis

```bash
# Testes completos (lint + unit + e2e)
npm run test:ci

# Build Docker
npm run docker:build

# Run Docker
npm run docker:run
```

### 📁 Arquivos da Pipeline

- `.github/workflows/ci.yml` - Configuração da pipeline
- `Dockerfile` - Imagem Docker
- `.dockerignore` - Arquivos ignorados no Docker
- `audit-ci.json` - Configuração de segurança

### 🔍 Monitoramento

A pipeline gera:
- ✅ Relatórios de testes
- ✅ Coverage reports
- ✅ Security audit reports
- ✅ Build artifacts
- ✅ Docker images

### 🚨 Troubleshooting

#### Pipeline falha nos testes:
- Verifique se o PostgreSQL está configurado
- Verifique as variáveis de ambiente
- Execute `npm run test:ci` localmente

#### Docker build falha:
- Verifique se o Dockerfile está correto
- Execute `npm run docker:build` localmente
- Verifique os secrets do Docker Hub

#### Security audit falha:
- Execute `npm audit` localmente
- Atualize dependências vulneráveis
- Configure allowlist no `audit-ci.json`
