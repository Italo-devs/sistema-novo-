# VipBarbeiro - Sistema de Agendamento de Barbearia

## 🎯 O que foi implementado

### ✅ Todas as melhorias solicitadas:

1. **Conversão de Minutos para Horas**
   - Formato inteligente: "30 minutos", "1 hora e 15 minutos", "7 horas e 33 minutos"
   - Aplicado em toda a aplicação

2. **Interface Organizada de Horários**
   - Grid visual com botões coloridos
   - Contador de seleção
   - Design responsivo e intuitivo

3. **Sistema de Cores Global**
   - Mudanças de cor afetam TODO o site
   - Cores primárias, secundárias e background
   - Atualização dinâmica e em tempo real

4. **Autenticação Profissional**
   - ❌ Removido: admin/admin123 (hardcoded)
   - ✅ Login com email e senha real
   - ✅ Verificação de email obrigatória
   - ✅ Recuperação de senha via email
   - ✅ Senhas hasheadas (bcrypt)
   - ✅ Tokens JWT para segurança

## 🚀 Como Iniciar

### Passo 1: Configurar API de Email

**IMPORTANTE:** Você precisa de uma chave da Resend para envio de emails.

1. Crie conta gratuita em: https://resend.com
2. Gere uma API Key no dashboard
3. Configure executando:
   ```bash
   cd /app
   ./setup.sh re_sua_chave_aqui
   ```

   OU edite manualmente `/app/backend/.env`:
   ```env
   RESEND_API_KEY="re_sua_chave_aqui"
   ```

4. Reinicie o backend:
   ```bash
   sudo supervisorctl restart backend
   ```

### Passo 2: Acessar o Sistema

- **Admin**: http://localhost:3000/admin
- **Site**: http://localhost:3000

### Primeiro Acesso
1. Acesse `/admin` - será redirecionado para registro
2. Crie sua conta com email e senha (min 8 caracteres)
3. Verifique seu email e clique no link
4. Pronto! Você está logado no dashboard

## 📁 Estrutura do Projeto

```
/app/
├── backend/
│   ├── server.py          # API FastAPI com autenticação
│   └── .env              # Configurações (IMPORTANTE!)
├── app/
│   ├── admin/            # Páginas de administração
│   │   ├── page.tsx              # Login
│   │   ├── register/             # Registro
│   │   ├── verify-email/         # Verificação
│   │   ├── forgot-password/      # Recuperação
│   │   ├── reset-password/       # Redefinição
│   │   └── dashboard/            # Dashboard admin
│   ├── layout.tsx        # Layout com sistema de cores
│   └── page.tsx          # Página principal
├── components/           # Componentes React
├── lib/
│   ├── store.ts          # Estado global
│   ├── types.ts          # TypeScript types
│   ├── time-utils.ts     # Formatação de tempo
│   └── color-system.tsx  # Sistema de cores dinâmico
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
└── setup.sh              # Script de configuração
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt (salt rounds)
- ✅ JWT tokens com expiração de 30 dias
- ✅ Verificação de email obrigatória
- ✅ Tokens de reset expiram em 1 hora
- ✅ MongoDB para persistência segura

## 🎨 Sistema de Cores

Acesse **Admin Dashboard → Configurações** para personalizar:
- Cor Principal (botões, destaques)
- Cor Secundária (acentos)
- Cor de Fundo do Site

As cores são aplicadas instantaneamente em:
- ✅ Cabeçalho
- ✅ Botões
- ✅ Cards
- ✅ Bordas
- ✅ Backgrounds
- ✅ Todos os componentes

## 📧 Sistema de Email

### Emails Automáticos:
1. **Verificação de Conta** - Enviado ao registrar
2. **Recuperação de Senha** - Enviado ao solicitar reset

### Importante sobre Resend (Plano Gratuito):
- Emails só vão para o email verificado na sua conta
- Limite: 100 emails/dia
- Para produção: verifique seu domínio ou faça upgrade

## 🛠️ Comandos Úteis

### Gerenciar Serviços
```bash
# Status
sudo supervisorctl status

# Reiniciar tudo
sudo supervisorctl restart all

# Reiniciar apenas backend
sudo supervisorctl restart backend

# Ver logs
tail -f /var/log/supervisor/backend.err.log
```

### Banco de Dados
```bash
# Acessar MongoDB
mongosh mongodb://localhost:27017

# Ver usuários admin
use test_database
db.admin_users.find()
```

## 🧪 Testar

### Backend API
```bash
# Verificar API
curl http://localhost:8001/api/

# Verificar se admin existe
curl -X POST http://localhost:8001/api/auth/check-admin-exists
```

### Funcionalidades
1. ✅ Registro de conta
2. ✅ Verificação de email
3. ✅ Login
4. ✅ Dashboard admin
5. ✅ Gestão de serviços
6. ✅ Gestão de barbeiros
7. ✅ Gestão de agendamentos
8. ✅ Configurações de cores
9. ✅ Recuperação de senha

## 📦 Tecnologias

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

**Backend:**
- FastAPI
- MongoDB
- Prisma
- Resend (emails)
- bcrypt (hashing)
- JWT (autenticação)

## ⚠️ Notas Importantes

### Para Produção:
1. Altere `JWT_SECRET` no `.env` para algo único e seguro
2. Configure `FRONTEND_URL` com seu domínio real
3. Use HTTPS
4. Configure CORS adequadamente
5. Verifique seu domínio na Resend

### Variáveis de Ambiente (.env)
```env
# MongoDB
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS
CORS_ORIGINS="*"  # Em produção, especifique domínios

# Resend Email
RESEND_API_KEY="re_sua_chave"
SENDER_EMAIL="onboarding@resend.dev"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Segurança
JWT_SECRET="mude_isso_em_producao"
```

## 🎉 Pronto!

Todas as alterações foram implementadas com sucesso. O sistema está completo e funcional!

**Próximo passo:** Configure sua API key da Resend para ativar os emails.

Para suporte ou dúvidas, consulte o arquivo `INSTRUCOES_IMPORTANTES.md`.
