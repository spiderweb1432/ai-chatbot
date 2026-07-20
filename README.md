# 🤖 AI Chat — Free LLM Chatbot

A full-stack AI chatbot powered by **Cloudflare Workers AI**. Completely free, no API keys required.

![React](https://img.shields.io/badge/React-18-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🧠 **5 Free LLM Models** — Llama 3.1, Llama 3.3 70B, Mistral, Gemma, Qwen
- 💬 **Beautiful Chat UI** — Dark theme, markdown support, responsive
- 💾 **Local History** — Conversations saved in localStorage
- ⚙️ **Custom System Prompts** — Make the AI behave how you want
- 🎯 **Model Switcher** — Switch between models mid-conversation
- 🔒 **100% Free** — No API keys, no credit card, no limits*

> *Cloudflare Workers AI free tier: 10,000 neurons/day

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (free)

### 1. Clone & Install

```bash
git clone https://github.com/spiderweb1432/ai-chatbot.git
cd ai-chatbot

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Deploy Backend (Cloudflare Worker)

```bash
cd backend
wrangler login
wrangler deploy
```

### 3. Configure Frontend

```bash
cd frontend
echo "VITE_API_URL=https://llm-chatbot-api.YOUR_SUBDOMAIN.workers.dev" > .env
```

### 4. Deploy Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=llm-chatbot-frontend
```

### 5. Done! 🎉

## 🧠 Available Models (All Free)

| Model | Best For |
|---|---|
| `llama-3.1-8b-instruct` | Fast, general use ⚡ |
| `llama-3.3-70b-instruct-fp8` | Complex reasoning 🧠 |
| `mistral-7b-instruct-v0.2` | Coding, analysis |
| `gemma-2-9b-it` | Creative writing |
| `qwen1.5-14b-chat-awq` | Multilingual |

## 📜 License

MIT — Use it however you want!