import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLayout() {
  const { user, loading, login, logout } = useAuth()

  if (loading) {
    return <div className="flex h-full items-center justify-center text-zinc-400">Cargando…</div>
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className="text-3xl font-bold">
          Agent<span className="text-indigo-400">Forge</span> · Admin
        </h1>
        <p className="max-w-md text-zinc-400">
          Panel de la agencia. Inicia sesión con tu cuenta de Google para gestionar agentes.
        </p>
        <button
          onClick={() => void login()}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
        >
          Entrar con Google
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <Link to="/admin" className="font-bold">
          Agent<span className="text-indigo-400">Forge</span>
          <span className="ml-2 text-xs font-normal text-zinc-500">Admin</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-zinc-400 sm:inline">{user.email}</span>
          <button
            onClick={() => void logout()}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
