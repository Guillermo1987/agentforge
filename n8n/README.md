# Agent Engine — workflows n8n

Dos workflows exportados listos para importar en n8n (self-hosted):

| Archivo | Qué hace | Trigger |
|---|---|---|
| `agent-engine.json` | Procesa cada mensaje del chat: lee config del agente, historial short-term y memoria long-term de Firestore, llama a Claude y persiste la respuesta. | `POST /webhook/agentforge-message` |
| `memory-consolidation.json` | Consolidación nocturna de memoria: fusiona/deduplica los facts de cada agente vía Claude y reescribe la colección limpia. | Cron diario 3:00 |

## Importar

n8n → **Workflows → Import from file** → seleccionar el JSON.

## Credenciales requeridas (configurar tras importar)

1. **Google API (service account)** — credencial `googleApi` de n8n con el JSON del
   service account del proyecto Firebase (`agent-forge-app`), scope
   `https://www.googleapis.com/auth/datastore`. La usan todos los nodos HTTP que
   hablan con la API REST de Firestore (`firestore.googleapis.com`). El Admin SDK /
   service account **no pasa por las firestore.rules** — por eso el engine puede
   escribir mensajes `assistant`.
2. **Claude API Key** — credencial genérica `Header Auth` con name `x-api-key` y
   value la API key de Anthropic. Asignarla a los nodos "Claude API" / "Claude consolida".

> **Alternativa sin API de pago** (plan Claude Pro/Max): sustituir el nodo HTTP
> "Claude API" por un nodo **Execute Command** que invoque
> `claude --print --output-format text` con el prompt construido. Requiere que n8n
> corra en la misma máquina que Claude Code con sesión iniciada.

## Variables a ajustar si cambia el proyecto

- Project ID de Firebase: las URLs usan `agent-forge-app` — buscar/reemplazar si el
  proyecto se llama distinto.
- Modelo: `claude-sonnet-4-6` en los Code nodes "Construir prompt" y
  "Preparar consolidación".

## Contrato del webhook

```json
POST /webhook/agentforge-message
{
  "agentId": "...",
  "conversationId": "...",
  "messageId": "...",
  "content": "texto del usuario"
}
```

El frontend (Chat.tsx) envía exactamente este payload. Si el workflow falla, la rama
de error marca el mensaje del usuario con `status: "error"` para que la UI no quede
esperando indefinidamente.
