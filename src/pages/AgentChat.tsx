import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Agent } from '../types'
import Chat from '../components/chat/Chat'

export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'not-found'>('loading')

  useEffect(() => {
    if (!agentId) return
    getDoc(doc(db, 'agents', agentId))
      .then((snap) => {
        if (snap.exists()) {
          setAgent({ id: snap.id, ...snap.data() } as Agent)
          setState('ready')
        } else {
          setState('not-found')
        }
      })
      .catch(() => setState('not-found'))
  }, [agentId])

  if (state === 'loading') {
    return <Centered>Cargando agente…</Centered>
  }
  if (state === 'not-found' || !agent) {
    return <Centered>Este agente no existe o la URL no es correcta.</Centered>
  }
  if (!agent.active) {
    return <Centered>Este agente está pausado temporalmente. Vuelve a intentarlo más tarde.</Centered>
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <header
        className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3"
        style={{ borderTopColor: agent.brandColor, borderTopWidth: 3 }}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: agent.brandColor }}
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="text-sm font-semibold">{agent.name}</h1>
          <p className="text-xs text-zinc-500">Agente IA · responde en segundos</p>
        </div>
      </header>
      <Chat agent={agent} />
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-zinc-400">
      {children}
    </div>
  )
}
