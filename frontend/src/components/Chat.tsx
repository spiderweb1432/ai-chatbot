import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react'
import type { Conversation, Message } from '../App'

interface Props {
  conversation: Conversation | null
  model: string
  systemPrompt: string
  onUpdate: (id: string, updates: Partial<Conversation>) => void
  onNewChat: () => void
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Chat({ conversation, model, systemPrompt, onUpdate, onNewChat }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = conversation?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    if (!conversation) { onNewChat(); return }

    const userMsg: Message = { id: generateId(), role: 'user', content: text, timestamp: Date.now() }
    const newMessages = [...messages, userMsg]
    onUpdate(conversation.id, {
      messages: newMessages,
      title: messages.length === 0 ? text.slice(0, 50) : conversation.title,
      model, systemPrompt, updatedAt: Date.now(),
    })
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model, systemPrompt,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      onUpdate(conversation.id, {
        messages: [...newMessages, { id: generateId(), role: 'assistant', content: data.response || 'No response.', timestamp: Date.now() }],
        updatedAt: Date.now(),
      })
    } catch (err: any) {
      onUpdate(conversation.id, {
        messages: [...newMessages, { id: generateId(), role: 'assistant', content: `⚠️ Error: ${err.message || 'Failed'}`, timestamp: Date.now() }],
        updatedAt: Date.now(),
      })
    } finally { setLoading(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Chat</h2>
          <p className="text-gray-400 mb-6 max-w-md">Free, open-source AI chat powered by Cloudflare Workers AI. No API key required.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {SUGGESTIONS.map((s, i) => (
              <button key={i}
                onClick={() => { onNewChat(); setInput(s) }}
                className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-sm text-gray-300 hover:border-blue-500/50 hover:text-white transition-all text-left"
              >{s}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
            <p>Start a conversation!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-blue-400" />
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-sm max-w-[80%]'
              : 'bg-[#1a1a2e] border border-white/10 text-gray-200 rounded-bl-sm markdown-body'}`}>
              {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p className="whitespace-pre-wrap">{msg.content}</p>}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0 mt-1">
                <User size={16} className="text-purple-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} className="text-blue-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1a1a2e] border border-white/10">
              <Loader2 size={16} className="animate-spin text-blue-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 resize-none min-h-[48px] max-h-[200px]"
            style={{ height: 'auto' }}
            onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 200) + 'px' }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  '🧠 Explain quantum computing',
  '💻 Write a Python function',
  '📝 Help me write an email',
  '🎯 Tips for productivity',
  '🌍 Tell me about space',
  '🎮 Game ideas in Python',
]