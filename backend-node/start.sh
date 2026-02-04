#!/bin/bash

echo "════════════════════════════════════════════════════"
echo "  🚀 Iniciando Backend Node.js - VipBarbeiro"
echo "════════════════════════════════════════════════════"
echo ""

# Verificar se a porta está em uso
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 8001 já está em uso. Liberando..."
    lsof -ti:8001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Navegar para a pasta
cd /app/backend-node

# Iniciar servidor
echo "🔄 Iniciando servidor..."
node index.js > /tmp/backend-node.log 2>&1 &

# Aguardar inicialização
sleep 3

# Verificar se iniciou
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo ""
    echo "✅ Backend iniciado com sucesso!"
    echo ""
    echo "📍 URL: http://localhost:8001"
    echo "📋 Logs: tail -f /tmp/backend-node.log"
    echo ""
    echo "════════════════════════════════════════════════════"
else
    echo ""
    echo "❌ Falha ao iniciar backend"
    echo "📋 Verifique os logs: cat /tmp/backend-node.log"
    echo ""
    exit 1
fi
