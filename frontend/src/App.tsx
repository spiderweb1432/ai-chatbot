import { useState, useEffect } from 'react'
import Chat from './components/Chat'
import Sidebar from './components/Sidebar'
import { Plus, Menu, X } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: string
  systemPrompt: string
  createdAt: number
  updatedAt: number
}

export const DEFAULT_MODELS = [
  { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B ⚡' },
  { id: '@cf/meta/llama-3.3-70b-instruct-fp8', name: 'Llama 3.3 70B 🧠' },
  { id: '@cf/mistralai/mistral-7b-instruct-v0.2', name: 'Mistral 7B' },
  { id: '@cf/google/gemma-2-9b-it', name: 'Gemma 2 9B' },
  { id: '@cf/qwen/qwen1.5-14b-chat-awq', name: 'Qwen 1.5 14B' },
]

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful, friendly AI assistant. You respond in the same language the user writes in. Be concise, accurate, and helpful.'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem('llm-conversations') || '[]')
  } catch { return [] }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem('llm-conversations', JSON.stringify(convs))
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(getConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [model, setModel] = useState(DEFAULT_MODELS[0].id)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  const active = conversations.find(c => c.id === activeId) || null

  function createConversation() {
    const conv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      model,
      systemPrompt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    setSidebarOpen(false)
  }

  function deleteConversation(id: string) {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  function updateConversation(id: string, updates: Partial<Conversation>) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  return (
    <div className="flex h-screen bg-[#0f0f23]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`
        fixed lg:relative z-50 h-full w-72 bg-[#1a1a2e] border-r border-white/10
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">\n            🤖 AI Chat
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-3">
          <button
            onClick={createConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setSidebarOpen(false) }}
          onDelete={deleteConversation}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-[#1a1a2e]">
          <p className="text-xs text-gray-500 text-center">Powered by Cloudflare Workers AI · 100% Free</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0f0f23]">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
          >
            {DEFAULT_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const p = window.prompt('System Prompt:', systemPrompt)
              if (p !== null) setSystemPrompt(p)
            }}
            className="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
          >
            ⚙️ System Prompt
          </button>
        </div>
        <Chat
          conversation={active}
          model={model}
          systemPrompt={systemPrompt}
          onUpdate={updateConversation}
          onNewChat={createConversation}
        />
      </div>
    </div>
  )
}