# Architecture

markweb's backend is organized into service domains under `app/Services/`, each encapsulating a distinct capability.

## Service Domains

### Agent (`app/Services/Agent/`)

Core AI runtime. `AgentRuntime` orchestrates message handling. `SessionResolver` manages sessions. `ContextAssembler` builds LLM context from conversation history and system prompts. `IntentRouter` classifies slash commands. `ModelRegistry` manages model selection.

Slash commands live in `Commands/`: help, info, model, new, rename.

### Tools (`app/Services/Tools/`)

Agent tool execution framework. `ToolResolver` discovers available tools. `SanitizingToolWrapper` wraps tools with security sanitization.

Built-in tools: `Bash`, `SandboxedBash`, `HttpRequest`, `CurrentDateTime`.

### Mail (`app/Services/Mail/`)

JMAP mail integration with the Stalwart mail server. Handles session management, mailbox operations, and email CRUD.

### Memory (`app/Services/Memory/`)

Embedding generation and semantic search using pgvector. Provides long-term memory for AI agent conversations.

### Security (`app/Services/Security/`)

Content sanitizer and injection audit system. Protects against prompt injection, XSS, and other attack vectors.

### Sandbox (`app/Services/Sandbox/`)

Proxmox CT pool for sandboxed code execution. Agents can execute untrusted code in isolated containers.

### Routines (`app/Services/Routines/`)

Scheduled and recurring agent actions. Enables automated tasks on configurable triggers.

## Key Models

| Model | Domain |
|-------|--------|
| `AgentSession`, `AgentMessage` | Agent conversations |
| `Agent`, `Tool`, `ToolExecution` | Agent configuration |
| `Memory` | Semantic memory |
| `User`, `UserSetting` | Authentication |
| `SystemPromptTemplate` | LLM prompting |
| `SandboxContainer` | Code execution |
| `ScheduledAction` | Routines |
| `InjectionDetection` | Security |
| `EmailThread` | Mail |

## Data Flow: Agent Chat

1. User sends message via WebSocket
2. `Agent\ChatController@send` receives it, dispatches `ProcessChatMessage` job
3. Job calls `AgentRuntime::handleStreamingMessage()`
4. Runtime assembles context via `ContextAssembler`, resolves tools via `ToolResolver`
5. `laravel/ai` streams response via `AnonymousAgent`
6. Tokens broadcast in real-time via Reverb WebSocket
7. Events: `SessionCreated`, `SessionUpdated`, `SessionDeleted` (lifecycle), `StreamEnd` (completion)

### Broadcast Channels

- `chat.user.{userId}` — session lifecycle events
- `chat.session.web.{userId}.{uuid}` — streaming tokens for a specific session

## Data Flow: JMAP Mail

Frontend Zustand stores (`stores/mail/`) manage all mail state:

- `session-store` — JMAP authentication
- `mailbox-store` — folders/mailboxes
- `email-store` — messages
- `compose-store` — draft composition
- `ui-store` — selection state

`lib/jmap-client.ts` creates a `JamClient` instance with Basic auth and URL rewriting (Stalwart internal URLs to app reverse proxy).

## MCP Integration

Model Context Protocol server at `app/Mcp/` with `Prompts/`, `Resources/`, `Servers/`, `Tools/` directories. Enables external tool and resource providers for the AI agent.
