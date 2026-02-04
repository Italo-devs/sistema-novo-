# 🚀 Backend Node.js - VipBarbeiro

## ✅ Backend Criado e Funcionando!

Backend Express.js separado rodando na porta **8001** com todas as rotas de autenticação implementadas.

---

## 📁 Estrutura do Projeto

```
/app/backend-node/
├── index.js                 # Servidor principal
├── package.json             # Dependências
├── .env                     # Variáveis de ambiente
├── config/
│   └── db.js               # Configuração MongoDB
├── models/
│   └── AdminUser.js        # Modelo de usuário admin
├── routes/
│   └── auth.js             # Rotas de autenticação
└── utils/
    └── auth.js             # Utilitários (JWT, bcrypt)
```

---

## 🔧 Como Rodar o Backend

### 1. Navegar para a pasta
```bash
cd /app/backend-node
```

### 2. Instalar dependências (já instalado)
```bash
npm install
```

### 3. Iniciar o servidor
```bash
# Modo produção
node index.js

# Modo desenvolvimento (com nodemon)
npm run dev
```

### 4. Verificar se está rodando
```bash
curl http://localhost:8001/
```

Resposta esperada:
```json
{
  "message": "VipBarbeiro API - Backend Node.js",
  "version": "1.0.0",
  "status": "online"
}
```

---

## 🛣️ Rotas Disponíveis

### 1. **GET /** - Informações da API
```bash
curl http://localhost:8001/
```

### 2. **GET /health** - Health Check
```bash
curl http://localhost:8001/health
```

### 3. **POST /api/auth/check-admin-exists** - Verifica se admin existe
```bash
curl -X POST http://localhost:8001/api/auth/check-admin-exists
```

**Resposta:**
```json
{ "exists": false }
```

### 4. **POST /api/auth/register** - Registrar novo admin
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipbarbeiro.com",
    "password": "senha12345"
  }'
```

**Resposta de sucesso:**
```json
{
  "message": "Conta criada com sucesso! Você já pode fazer login.",
  "email": "admin@vipbarbeiro.com",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "auto_verified": true
}
```

### 5. **POST /api/auth/login** - Fazer login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipbarbeiro.com",
    "password": "senha12345"
  }'
```

**Resposta de sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@vipbarbeiro.com"
}
```

### 6. **POST /api/auth/verify-email** - Verificar email (não usado no modo dev)
```bash
curl -X POST http://localhost:8001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipbarbeiro.com",
    "token": "token_de_verificacao"
  }'
```

### 7. **POST /api/auth/forgot-password** - Solicitar reset de senha
```bash
curl -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipbarbeiro.com"
  }'
```

### 8. **POST /api/auth/reset-password** - Redefinir senha
```bash
curl -X POST http://localhost:8001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vipbarbeiro.com",
    "token": "reset_token",
    "new_password": "nova_senha123"
  }'
```

---

## 🔐 Segurança Implementada

✅ **Senhas hasheadas** com bcrypt (10 salt rounds)
✅ **JWT tokens** com expiração de 30 dias
✅ **Validação de dados** com express-validator
✅ **CORS configurado** para o frontend
✅ **Error handling** global
✅ **MongoDB** para persistência

---

## ⚙️ Variáveis de Ambiente (.env)

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# Server
PORT=8001
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_mude_em_producao_12345678

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 Integração com Frontend

O frontend já está configurado para usar este backend através do arquivo `/app/lib/api-config.ts`:

```typescript
export const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin + '/api'
  : 'http://localhost:8001/api';
```

E o Next.js tem um proxy configurado em `next.config.mjs`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8001/api/:path*',
    },
  ];
}
```

---

## 📊 Formato das Respostas

### ✅ Sucesso
Todas as respostas de sucesso retornam JSON:
```json
{
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### ❌ Erro
Todas as respostas de erro retornam JSON com status HTTP apropriado:
```json
{
  "error": "Tipo do erro",
  "detail": "Descrição detalhada do erro"
}
```

**Nunca retorna HTML ou texto puro!**

---

## 🧪 Testando o Backend

### Script de teste completo:
```bash
#!/bin/bash

echo "=== 1. Verificando se backend está online ==="
curl -s http://localhost:8001/ | jq

echo ""
echo "=== 2. Verificando se admin existe ==="
curl -s -X POST http://localhost:8001/api/auth/check-admin-exists | jq

echo ""
echo "=== 3. Registrando novo admin ==="
curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"senha12345"}' | jq

echo ""
echo "=== 4. Fazendo login ==="
curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"senha12345"}' | jq

echo ""
echo "✅ Todos os testes concluídos!"
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se a porta 8001 está em uso
lsof -ti:8001

# Matar processo na porta 8001
lsof -ti:8001 | xargs kill -9

# Verificar logs
tail -f /tmp/backend-node.log
```

### MongoDB não conecta
```bash
# Verificar se MongoDB está rodando
sudo supervisorctl status mongodb

# Iniciar MongoDB
sudo supervisorctl start mongodb
```

### Erro de CORS
Verifique se `FRONTEND_URL` no `.env` está correto:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 📦 Dependências

- **express** - Framework web
- **cors** - CORS middleware
- **dotenv** - Variáveis de ambiente
- **mongodb** - Driver MongoDB
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - JWT tokens
- **express-validator** - Validação de dados

---

## 🚀 Próximos Passos

### Para adicionar novas rotas:

1. Criar arquivo em `/routes/` (ex: `appointments.js`)
2. Importar no `index.js`
3. Adicionar rota: `app.use('/api/appointments', appointmentsRoutes);`

### Exemplo de nova rota:
```javascript
// routes/appointments.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Lógica aqui
    res.json({ appointments: [] });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar agendamentos',
      detail: error.message,
    });
  }
});

module.exports = router;
```

---

## ✨ Status

- ✅ Backend Node.js criado
- ✅ Express configurado
- ✅ MongoDB conectado
- ✅ CORS configurado
- ✅ Todas as rotas de autenticação implementadas
- ✅ JSON válido em todas as respostas
- ✅ Error handling global
- ✅ Validação de dados
- ✅ Segurança implementada

**Backend 100% funcional e pronto para uso!** 🎉
