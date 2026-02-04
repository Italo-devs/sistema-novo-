# 📋 Instruções de Configuração - VipBarbeiro

## ✅ Alterações Implementadas

### 1. ✨ Conversão de Minutos para Horas
- ✅ Todos os displays de duração agora mostram formato legível
- ✅ Exemplo: "453 minutos" → "7 horas e 33 minutos"
- ✅ Aplicado em: Admin Dashboard, Serviços, Booking

### 2. 🎨 Reorganização Visual dos Horários Disponíveis
- ✅ Interface melhorada para seleção de horários no Admin
- ✅ Grid organizado com botões visuais
- ✅ Contador de horários selecionados
- ✅ Design mais limpo e responsivo

### 3. 🌈 Sistema de Cores Global
- ✅ Sistema dinâmico implementado
- ✅ Cores afetam TODO o site incluindo:
  - Cabeçalho
  - Botões
  - Cards
  - Bordas
  - Backgrounds
- ✅ Atualização em tempo real ao mudar nas configurações

### 4. 🔐 Sistema de Autenticação Profissional
- ✅ Autenticação com email e senha real
- ✅ Sistema de registro de primeira conta
- ✅ Verificação de email obrigatória
- ✅ Recuperação de senha via email
- ✅ Hash de senhas com bcrypt
- ✅ JWT tokens para sessões
- ✅ Banco de dados MongoDB para usuários

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### 🔑 API Key do Resend (IMPORTANTE!)

Para o sistema de envio de emails funcionar, você precisa configurar sua chave da Resend:

#### Passo 1: Criar Conta na Resend
1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Verifique seu email

#### Passo 2: Gerar API Key
1. No dashboard da Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "VipBarbeiro")
4. Copie a chave que começa com `re_...`

#### Passo 3: Configurar no Projeto
1. Abra o arquivo: `/app/backend/.env`
2. Substitua esta linha:
   ```
   RESEND_API_KEY="your_resend_api_key_here"
   ```
   Por:
   ```
   RESEND_API_KEY="re_sua_chave_aqui"
   ```

3. Se quiser usar seu próprio email de envio (opcional):
   ```
   SENDER_EMAIL="seu@dominio.com"
   ```
   
   **Nota**: No plano gratuito, use `onboarding@resend.dev` ou adicione seu domínio na Resend.

#### Passo 4: Reiniciar Backend
Após configurar, reinicie o backend:
```bash
sudo supervisorctl restart backend
```

## 🚀 Como Usar o Sistema de Autenticação

### Primeira Vez (Criar Conta Admin)
1. Acesse: `http://localhost:3000/admin`
2. Será redirecionado automaticamente para registro
3. Digite seu email e senha (mínimo 8 caracteres)
4. Verifique seu email e clique no link de verificação
5. Será automaticamente logado no dashboard

### Login Subsequente
1. Acesse: `http://localhost:3000/admin`
2. Digite seu email e senha
3. Clique em "Entrar"

### Esqueceu a Senha?
1. Na tela de login, clique em "Esqueceu sua senha?"
2. Digite seu email
3. Receberá um link para redefinir a senha
4. Crie uma nova senha

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `/app/lib/time-utils.ts` - Funções de formatação de tempo
- `/app/lib/color-system.tsx` - Sistema dinâmico de cores
- `/app/prisma/schema.prisma` - Schema do banco de dados
- `/app/prisma/prisma.config.ts` - Configuração do Prisma
- `/app/app/admin/register/page.tsx` - Página de registro
- `/app/app/admin/verify-email/page.tsx` - Verificação de email
- `/app/app/admin/forgot-password/page.tsx` - Recuperação de senha
- `/app/app/admin/reset-password/page.tsx` - Redefinir senha

### Arquivos Modificados
- `/app/backend/server.py` - API de autenticação completa
- `/app/backend/.env` - Variáveis de ambiente
- `/app/app/layout.tsx` - Provider de cores
- `/app/app/admin/page.tsx` - Login com email
- `/app/app/admin/dashboard/page.tsx` - Formatação de tempo e UI melhorada
- `/app/components/*.tsx` - Formatação de tempo em todos componentes

## 🧪 Testar o Sistema

### 1. Verificar Backend
```bash
curl http://localhost:8001/api/
# Deve retornar: {"message":"VipBarbeiro API"}
```

### 2. Testar Sistema de Email (depois de configurar API key)
```bash
curl -X POST http://localhost:8001/api/auth/check-admin-exists
# Deve retornar: {"exists":false} (primeira vez)
```

### 3. Acessar Interface
- Admin: `http://localhost:3000/admin`
- Site principal: `http://localhost:3000`

## ⚠️ Notas Importantes

### Modo de Teste da Resend
- **No plano gratuito**, emails só são enviados para o email verificado na sua conta Resend
- Para enviar para qualquer email, você precisa:
  1. Verificar seu domínio na Resend, OU
  2. Fazer upgrade do plano

### Desenvolvimento vs Produção
- As credenciais atuais são para desenvolvimento
- Em produção:
  1. Mude `JWT_SECRET` para algo mais seguro
  2. Configure `FRONTEND_URL` com seu domínio real
  3. Use HTTPS
  4. Configure CORS corretamente

### Banco de Dados
- MongoDB rodando localmente na porta 27017
- Coleção `admin_users` guarda os administradores
- Senhas são hasheadas com bcrypt (nunca armazenadas em texto puro)

## 🎉 Resumo

Todas as alterações solicitadas foram implementadas:
- ✅ Conversão de minutos para horas e minutos
- ✅ Interface organizada para horários disponíveis
- ✅ Sistema de cores afetando todo o site
- ✅ Autenticação profissional com email real
- ✅ Recuperação de senha funcional
- ✅ Verificação de email na criação

**Próximo passo**: Configure a API key da Resend para ativar o envio de emails!
