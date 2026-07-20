import { MessageSquare, Trash2 } from 'lucide-react'
import type { Conversation } from '../App'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function Sidebar({ conversations, activeId, onSelect, onDelete }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
        <p>No conversations yet</p>
        <p className="text-xs mt-1">Click \"New Chat\" to start</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`
            group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors
            ${conv.id === activeId
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }
          `}
        >
          <MessageSquare size={14} className="shrink-0" />
          <span className="truncate flex-1">{conv.title}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}