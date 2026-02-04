#!/bin/bash

# Script de Configuração do VipBarbeiro

echo "================================================"
echo "🪒 VipBarbeiro - Configuração da API de Email"
echo "================================================"
echo ""

# Verificar se a chave já está configurada
CURRENT_KEY=$(grep "RESEND_API_KEY" /app/backend/.env | cut -d'"' -f2)

if [ "$CURRENT_KEY" = "your_resend_api_key_here" ]; then
    echo "⚠️  API Key da Resend NÃO configurada!"
    echo ""
    echo "Para configurar:"
    echo "1. Acesse: https://resend.com"
    echo "2. Crie uma conta e gere uma API Key"
    echo "3. Execute: ./setup.sh <sua_api_key>"
    echo ""
    echo "Exemplo:"
    echo "  ./setup.sh re_abc123..."
    exit 1
fi

if [ -n "$1" ]; then
    echo "📝 Atualizando API Key..."
    sed -i "s/RESEND_API_KEY=\".*\"/RESEND_API_KEY=\"$1\"/" /app/backend/.env
    echo "✅ API Key atualizada!"
    echo ""
    echo "🔄 Reiniciando backend..."
    sudo supervisorctl restart backend
    echo "✅ Backend reiniciado!"
    echo ""
    echo "🎉 Configuração concluída!"
    echo "Acesse: http://localhost:3000/admin para começar"
else
    echo "✅ API Key já configurada!"
    echo "Chave atual: ${CURRENT_KEY:0:10}..."
    echo ""
    echo "Para atualizar, execute:"
    echo "  ./setup.sh <nova_api_key>"
fi

echo ""
echo "================================================"
