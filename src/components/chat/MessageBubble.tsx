import type { Message } from '../../types'

interface Props {
  message: Message
  brandColor: string
}

export default function MessageBubble({ message, brandColor }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
          isUser
            ? 'rounded-br-sm text-white'
            : 'rounded-bl-sm bg-zinc-800 text-zinc-100'
        }`}
        style={isUser ? { backgroundColor: brandColor } : undefined}
      >
        {message.content}
        {message.status === 'error' && (
          <p className="mt-1 text-xs text-red-300">
            ⚠ El agente no pudo responder. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </div>
  )
}
