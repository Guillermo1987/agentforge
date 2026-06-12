import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const AVAILABLE_TOOLS = ['web_search', 'knowledge_base', 'calendar', 'email'] as const

export default function AgentForm() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const isNew = !agentId

  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [clientId, setClientId] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [tools, setTools] = useState<string[]>([])
  const [shortTermWindow, setShortTermWindow] = useState(10)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!agentId) return
    void getDoc(doc(db, 'agents', agentId)).then((snap) => {
      if (!snap.exists()) return
      const a = snap.data()
      setName(a.name ?? '')
      setSystemPrompt(a.systemPrompt ?? '')
      setClientId(a.clientId ?? '')
      setBrandColor(a.brandColor ?? '#6366f1')
      setTools(a.tools ?? [])
      setShortTermWindow(a.shortTermWindow ?? 10)
    })
  }, [agentId])

  function toggleTool(tool: string) {
    setTools((t) => (t.includes(tool) ? t.filter((x) => x !== tool) : [...t, tool]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = { name, systemPrompt, clientId, brandColor, tools, shortTermWindow }
    try {
      if (isNew) {
        await addDoc(collection(db, 'agents'), {
          ...data,
          active: true,
          createdAt: serverTimestamp(),
        })
      } else {
        await updateDoc(doc(db, 'agents', agentId), data)
      }
      navigate('/admin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-bold">{isNew ? 'Crear agente' : 'Editar agente'}</h1>

      <Field label="Nombre">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Asistente de Clínica Dental Sonrisa"
        />
      </Field>

      <Field label="Cliente (identificador interno)">
        <input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="input"
          placeholder="clinica-sonrisa"
        />
      </Field>

      <Field label="System prompt">
        <textarea
          required
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={10}
          className="input font-mono text-xs"
          placeholder="Eres el asistente virtual de… Tu tono es… Nunca…"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Define identidad, tono, límites y conocimiento del agente. La memoria long-term se
          inyecta automáticamente a continuación.
        </p>
      </Field>

      <Field label="Herramientas activadas">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TOOLS.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => toggleTool(tool)}
              className={`rounded-md border px-3 py-1.5 text-xs transition ${
                tools.includes(tool)
                  ? 'border-indigo-500 bg-indigo-950 text-indigo-300'
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Color de marca">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-md border border-zinc-700 bg-zinc-950"
          />
        </Field>
        <Field label="Memoria short-term (mensajes)">
          <input
            type="number"
            min={2}
            max={50}
            value={shortTermWindow}
            onChange={(e) => setShortTermWindow(Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : isNew ? 'Crear agente' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  )
}
