import type { Timestamp } from 'firebase/firestore'

export interface Agent {
  id: string
  name: string
  systemPrompt: string
  tools: string[]
  clientId: string
  brandColor: string
  active: boolean
  /** Nº de mensajes de memoria short-term inyectados en contexto (default 10) */
  shortTermWindow: number
  createdAt: Timestamp | null
}

export interface Conversation {
  id: string
  agentId: string
  userId: string
  startedAt: Timestamp | null
  lastMessage: string
}

export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Message {
  id: string
  conversationId: string
  agentId: string
  role: MessageRole
  content: string
  status: MessageStatus
  timestamp: Timestamp | null
}

export interface MemoryFact {
  id: string
  content: string
  /** conversationId del que se extrajo el hecho */
  source: string
  createdAt: Timestamp | null
}
