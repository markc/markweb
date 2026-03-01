# AI Agent

markweb includes a full-featured AI agent platform with tool execution, memory, and real-time WebSocket streaming.

## AgentRuntime

The core orchestrator at `app/Services/Agent/AgentRuntime.php`. Handles the complete message lifecycle:

1. Receives user message
2. Resolves session via `SessionResolver`
3. Assembles context via `ContextAssembler` (conversation history, system prompts, tool definitions)
4. Classifies intent via `IntentRouter` (slash commands vs natural language)
5. Streams response via `laravel/ai` using `AnonymousAgent`
6. Broadcasts tokens in real-time via Reverb

## Chat Routing

| Route | Controller | Transport |
|-------|-----------|-----------|
| `/chat` | `Agent\ChatController` | WebSocket (Reverb) |
| `/sse-chat` | `ChatController` | SSE (legacy, Prism-based) |

The primary chat experience uses `/chat` with WebSocket streaming. The legacy SSE chat remains available at `/sse-chat`.

## Slash Commands

Built-in commands in `app/Services/Agent/Commands/`:

| Command | Purpose |
|---------|---------|
| `/help` | Show available commands |
| `/info` | Session and model information |
| `/model` | Switch LLM model |
| `/new` | Start new conversation |
| `/rename` | Rename current session |

## Tools

Agent tools enable the AI to take actions. Built-in tools in `app/Services/Tools/`:

- **Bash** — Execute shell commands
- **SandboxedBash** — Execute in isolated Proxmox container
- **HttpRequest** — Make HTTP requests
- **CurrentDateTime** — Get current date/time

`ToolResolver` discovers available tools. `SanitizingToolWrapper` applies security sanitization before execution.

## Memory

Semantic memory using pgvector embeddings. The Memory service generates embeddings via Ollama and stores them in PostgreSQL for similarity search.

This gives the agent long-term recall across conversations — it can reference previous interactions and learn user preferences.

## Model Registry

`ModelRegistry` manages available LLM models. Anthropic is the primary provider. Models can be switched per-session via the `/model` slash command.

## WebSocket Events

Streaming uses Laravel Reverb with these broadcast channels:

```
chat.user.{userId}                    — session lifecycle
chat.session.web.{userId}.{uuid}      — token stream
```

Events:
- `SessionCreated` — new conversation started
- `SessionUpdated` — session metadata changed
- `SessionDeleted` — conversation deleted
- `StreamEnd` — response complete

## Security

The Security service (`app/Services/Security/`) provides:

- Content sanitization for user inputs
- Injection detection and audit logging
- Rate limiting on tool execution
- Sandbox isolation for untrusted code
