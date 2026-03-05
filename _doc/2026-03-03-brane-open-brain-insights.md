# Brane — Insights from Open Brain Architecture

Extracted from Nate's "Open Brain" video (March 2026). Concepts that apply to Brane's Phase 2 and beyond.

## Key Thesis

> Memory architecture determines agent capabilities much more than model selection does.

This validates Brane's entire approach — local pgvector + MCP server as foundational infrastructure rather than depending on platform memory (Claude, ChatGPT, etc.).

## Ideas to Adopt

### 1. Metadata Extraction at Ingest Time

Currently `brane_store` saves raw content + manual tags. An LLM pass at ingest could auto-extract:
- **People** mentioned (names, roles, relationships)
- **Topics** / categories
- **Action items** / decisions
- **Sentiment** / urgency

This enriches search without requiring the user to tag manually. Could be an optional step in `brane_store` and `brane_index` — call a local LLM (Ollama) to classify before embedding.

### 2. Weekly Review / Consolidation

End-of-week synthesis across everything captured:
- Cluster by topic
- Surface unresolved action items
- Detect patterns across days
- Find connections between unrelated captures
- Identify gaps in what's being tracked

Maps directly to the planned `BraneConsolidator` (Phase 2). Should run as a scheduled job (cron or Laravel scheduler) and produce a summary that itself gets stored as a memory — compounding knowledge.

### 3. Memory Migration from Platform Silos

One-time import of existing memory from Claude, ChatGPT, etc. into Brane. Useful onboarding step:
- Extract Claude's memory (available via settings export)
- Extract ChatGPT's memory (available via data export)
- Parse, chunk, embed, store into Brane with appropriate metadata

This ensures Brane starts with accumulated context rather than zero.

### 4. Dashboard Visualisation

Patterns over time — what topics cluster, what's been forgotten, what's active:
- Thinking patterns over weeks/months
- Daily digest surfacing forgotten but relevant ideas
- Knowledge graph of connections between memories

Maps to Phase 2 DCS dashboard panels.

## Brane Advantages Over Open Brain

| Aspect | Open Brain | Brane |
|--------|-----------|-------|
| Hosting | Supabase cloud | Fully local (zero cost, zero dependency) |
| Embeddings | Paid API via edge function | Local Ollama (free) |
| Search | Vector-only semantic | Hybrid RRF: vector + keyword + recency decay |
| Structure | Flat bucket of thoughts | Domain/project-aware with filtering |
| Batch ingest | Manual thought-by-thought | `brane_index` auto-chunks directories |
| Data ownership | Cloud-hosted DB | Your machine, full stop |

## Quotable Framing

- "Your knowledge should not be a hostage to any single platform"
- "Every thought you capture makes the next search smarter"
- "The gap between 'I use AI sometimes' and 'AI is embedded in how I think' is the career gap of this decade"
- "We do good context engineering for our human brains when we build the right context engineering for AI"
- Platform memory = "five separate piles of sticky notes on five separate desks"
