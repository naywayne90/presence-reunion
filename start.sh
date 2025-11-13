#!/bin/bash

# Script de démarrage pour Presence Reunion
echo "🚀 Démarrage de Presence Reunion..."
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Vérifier l'authentification Convex
if [ ! -d "$HOME/.convex" ]; then
    echo "⚠️  Vous devez d'abord vous authentifier avec Convex:"
    echo "   npx convex login"
    echo ""
    exit 1
fi

echo "✅ Lancement des services..."
echo ""
echo "📍 Terminal 1: Convex Dev Server"
echo "📍 Terminal 2: Next.js Dev Server"
echo ""

# Lancer Convex en arrière-plan
echo "🔧 Démarrage de Convex..."
npx convex dev &
CONVEX_PID=$!

# Attendre que Convex soit prêt
sleep 5

# Lancer Next.js en arrière-plan
echo "🎨 Démarrage de Next.js..."
npm run dev &
NEXTJS_PID=$!

echo ""
echo "✅ Services démarrés!"
echo ""
echo "🌐 Application accessible sur: http://localhost:3000"
echo "📊 Dashboard Convex: https://dashboard.convex.dev"
echo ""
echo "Pour arrêter les services, appuyez sur Ctrl+C"
echo ""

# Fonction pour arrêter proprement
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $CONVEX_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

trap cleanup INT TERM

# Attendre que l'utilisateur arrête
wait
