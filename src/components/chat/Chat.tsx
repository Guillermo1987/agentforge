import { useEffect, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, N8N_WEBHOOK_URL } from '../../lib/firebase'
import type { Agent, Message } from '../../types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import MessageInput from './MessageInput'

interface Props {
  agent: Agent
}

/** Recupera (o crea) un id de conversación persistente por agente en este navegador. */
function getConversationId(agentId: string): string {
  const key = `agentforge:conversation:${agentId}`
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function Chat({ agent }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId] = useState(() => getConversationId(agent.id))
  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationReady = useRef(false)

  // Listener realtime: la respuesta del agente aparece sin reload.
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message))
    })
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const waiting = messages.some(
    (m) => m.role === 'user' && (m.status === 'pending' || m.status === 'processing'),
  )

  async function send(content: string) {
    // 1. Asegurar la conversación: crear si no existe, si no solo lastMessage
    //    (las rules limitan el update público a ese campo).
    const convRef = doc(db, 'conversations', conversationId)
    if (!conversationReady.current) {
      const snap = await getDoc(convRef)
      if (!snap.exists()) {
        await setDoc(convRef, {
          agentId: agent.id,
          userId: 'anonymous',
          startedAt: serverTimestamp(),
          lastMessage: content,
        })
      } else {
        await updateDoc(convRef, { lastMessage: content })
      }
      conversationReady.current = true
    } else {
      await updateDoc(convRef, { lastMessage: content })
    }

    // 2. Escribir el mensaje del usuario (status pending).
    const msgRef = await addDoc(collection(db, 'messages'), {
      conversationId,
      agentId: agent.id,
      role: 'user',
      content,
      status: 'pending',
      timestamp: serverTimestamp(),
    })

    // 3. Avisar al Agent Engine (n8n). Si falla, marcar el mensaje en error.
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          conversationId,
          messageId: msgRef.id,
          content,
        }),
      })
      if (!res.ok) throw new Error(`webhook ${res.status}`)
    } catch {
      await updateDoc(msgRef, { status: 'error' }).catch(() => {})
    }
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-zinc-500">
            Escribe tu primer mensaje para hablar con {agent.name}.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} brandColor={agent.brandColor} />
        ))}
        {waiting && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={send} disabled={waiting} brandColor={agent.brandColor} />
    </>
  )
}
