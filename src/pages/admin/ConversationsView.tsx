import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Conversation, Message } from '../../types'

export default function ConversationsView() {
  const { agentId } = useParams<{ agentId: string }>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!agentId) return
    const q = query(
      collection(db, 'conversations'),
      where('agentId', '==', agentId),
      orderBy('startedAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation))
    })
  }, [agentId])

  useEffect(() => {
    if (!selected) {
      setMessages([])
      return
    }
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selected),
      orderBy('timestamp', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message))
    })
  }, [selected])

  const filtered = conversations.filter(
    (c) => !search || c.lastMessage?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Conversaciones</h1>
        <Link to="/admin" className="text-sm text-indigo-400 hover:underline">
          ← Volver a agentes
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por último mensaje…"
        className="input mb-4"
      />

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="text-sm text-zinc-500">Sin conversaciones todavía.</li>
          )}
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelected(c.id)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                  selected === c.id
                    ? 'border-indigo-500 bg-indigo-950/40'
                    : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                <p className="truncate text-zinc-200">{c.lastMessage || '(vacía)'}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {c.startedAt?.toDate().toLocaleString() ?? '—'}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          {!selected && <p className="text-sm text-zinc-500">Selecciona una conversación.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-indigo-900/60' : 'bg-zinc-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-right text-[10px] text-zinc-500">{m.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
