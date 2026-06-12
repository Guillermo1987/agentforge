import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

const AgentChat = lazy(() => import('./pages/AgentChat'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AgentsList = lazy(() => import('./pages/admin/AgentsList'))
const AgentForm = lazy(() => import('./pages/admin/AgentForm'))
const ConversationsView = lazy(() => import('./pages/admin/ConversationsView'))
const MemoryView = lazy(() => import('./pages/admin/MemoryView'))

function Landing() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        Agent<span className="text-indigo-400">Forge</span>
      </h1>
      <p className="max-w-xl text-lg text-zinc-400">
        Despliega agentes IA personalizados con memoria cognitiva para tus clientes
        en menos de una hora. Configura un system prompt, herramientas y memoria —
        entrega una URL de chat lista para usar.
      </p>
      <Link
        to="/admin"
        className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
      >
        Entrar al panel de la agencia
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-zinc-500">Cargando…</div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat/:agentId" element={<AgentChat />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AgentsList />} />
          <Route path="agents/new" element={<AgentForm />} />
          <Route path="agents/:agentId" element={<AgentForm />} />
          <Route path="agents/:agentId/conversations" element={<ConversationsView />} />
          <Route path="agents/:agentId/memory" element={<MemoryView />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
