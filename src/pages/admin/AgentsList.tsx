import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Agent } from '../../types'

export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'agents'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setAgents(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Agent))
    })
  }, [])

  async function toggleActive(agent: Agent) {
    await updateDoc(doc(db, 'agents', agent.id), { active: !agent.active })
  }

  async function remove(agent: Agent) {
    if (!confirm(`¿Borrar el agente "${agent.name}"? Esta acción no se puede deshacer.`)) return
    await deleteDoc(doc(db, 'agents', agent.id))
  }

  function copyUrl(agentId: string) {
    const url = `${window.location.origin}/chat/${agentId}`
    void navigator.clipboard.writeText(url)
    setCopied(agentId)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Agentes</h1>
        <Link
          to="/admin/agents/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          + Crear agente
        </Link>
      </div>

      {agents.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
          Aún no hay agentes. Crea el primero para entregar una URL de chat a tu cliente.
        </p>
      )}

      <ul className="space-y-3">
        {agents.map((agent) => (
          <li
            key={agent.id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: agent.brandColor }}
              >
                {agent.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">
                  {agent.name}
                  {!agent.active && (
                    <span className="ml-2 rounded bg-amber-900/60 px-1.5 py-0.5 text-xs text-amber-300">
                      pausado
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">cliente: {agent.clientId || '—'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => copyUrl(agent.id)} className="btn-ghost">
                {copied === agent.id ? '✓ Copiada' : 'Copiar URL'}
              </button>
              <Link to={`/admin/agents/${agent.id}`} className="btn-ghost">
                Editar
              </Link>
              <Link to={`/admin/agents/${agent.id}/conversations`} className="btn-ghost">
                Conversaciones
              </Link>
              <Link to={`/admin/agents/${agent.id}/memory`} className="btn-ghost">
                Memoria
              </Link>
              <button onClick={() => void toggleActive(agent)} className="btn-ghost">
                {agent.active ? 'Pausar' : 'Activar'}
              </button>
              <button
                onClick={() => void remove(agent)}
                className="rounded-md border border-red-900 px-3 py-1.5 text-red-400 transition hover:bg-red-950"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
