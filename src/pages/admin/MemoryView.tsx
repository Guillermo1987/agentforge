import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { MemoryFact } from '../../types'

export default function MemoryView() {
  const { agentId } = useParams<{ agentId: string }>()
  const [facts, setFacts] = useState<MemoryFact[]>([])
  const [newFact, setNewFact] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    if (!agentId) return
    const q = query(collection(db, 'memory', agentId, 'facts'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setFacts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MemoryFact))
    })
  }, [agentId])

  async function addFact(e: FormEvent) {
    e.preventDefault()
    const content = newFact.trim()
    if (!content || !agentId) return
    await addDoc(collection(db, 'memory', agentId, 'facts'), {
      content,
      source: 'manual',
      createdAt: serverTimestamp(),
    })
    setNewFact('')
  }

  async function saveEdit(factId: string) {
    if (!agentId) return
    await updateDoc(doc(db, 'memory', agentId, 'facts', factId), { content: editValue })
    setEditing(null)
  }

  async function removeFact(factId: string) {
    if (!agentId) return
    await deleteDoc(doc(db, 'memory', agentId, 'facts', factId))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Memoria long-term</h1>
        <Link to="/admin" className="text-sm text-indigo-400 hover:underline">
          ← Volver a agentes
        </Link>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        Hechos que el Agent Engine inyecta en el system prompt de cada turno. Se extraen
        automáticamente de las conversaciones; aquí puedes revisarlos, corregirlos o añadir nuevos.
      </p>

      <form onSubmit={addFact} className="mb-5 flex gap-2">
        <input
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          placeholder="Añadir hecho manualmente… (ej: el cliente prefiere citas por la tarde)"
          className="input flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Añadir
        </button>
      </form>

      <ul className="space-y-2">
        {facts.length === 0 && (
          <li className="rounded-lg border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            Sin hechos memorizados todavía. Se irán generando con las conversaciones.
          </li>
        )}
        {facts.map((fact) => (
          <li
            key={fact.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
          >
            {editing === fact.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input flex-1"
                  autoFocus
                />
                <button onClick={() => void saveEdit(fact.id)} className="btn-ghost">
                  Guardar
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm">{fact.content}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    origen: {fact.source === 'manual' ? 'manual' : `conversación ${fact.source}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setEditing(fact.id)
                      setEditValue(fact.content)
                    }}
                    className="btn-ghost"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => void removeFact(fact.id)}
                    className="rounded-md border border-red-900 px-3 py-1.5 text-red-400 transition hover:bg-red-950"
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
