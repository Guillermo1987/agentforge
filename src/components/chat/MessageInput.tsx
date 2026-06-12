import { useState, type FormEvent } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled: boolean
  brandColor: string
}

export default function MessageInput({ onSend, disabled, brandColor }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-800 bg-zinc-900 p-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe un mensaje…"
        maxLength={4000}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        style={{ backgroundColor: brandColor }}
      >
        Enviar
      </button>
    </form>
  )
}
