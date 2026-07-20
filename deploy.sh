#!/bin/bash
set -e

echo "🚀 AI Chatbot — One-Click Deploy to Cloudflare"
echo "=============================================="

if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo "🔐 Checking Cloudflare login..."
wrangler whoami || wrangler login

echo ""
echo "📡 Deploying backend (Cloudflare Worker)..."
cd backend
npm install
wrangler deploy
echo "✅ Backend deployed!"

echo ""
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo ""
echo "📄 Deploying frontend (Cloudflare Pages)..."
wrangler pages deploy dist --project-name=llm-chatbot-frontend
echo "✅ Frontend deployed!"

echo ""
echo "=============================================="
echo "🎉 DEPLOY COMPLETE!"
echo "Frontend: https://llm-chatbot-frontend.pages.dev"
echo "Backend:  Check 'wrangler deployment' output above"
echo "=============================================="