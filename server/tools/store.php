<?php

declare(strict_types=1);

/**
 * brane_store — Persist a memory with auto-embedding.
 */

return [
    'brane_store' => new Tool(
        description: 'Store a memory in Brane with automatic embedding. Use this to persist knowledge, decisions, patterns, or context that should survive across sessions.',
        inputSchema: schema([
            'content' => prop('string', 'The content to store as a memory'),
            'domain' => prop('string', 'Knowledge domain: "gh" (GitHub projects) or "ns" (NetServa ops). Auto-detected from cwd if omitted.', ['enum' => ['gh', 'ns']]),
            'project' => prop('string', 'Project name (e.g. "markweb", "spe"). Auto-detected from cwd if omitted.'),
            'type' => prop('string', 'Memory type', ['default' => 'document']),
            'tags' => prop('array', 'Tags for filtering', ['items' => ['type' => 'string']]),
        ], ['content']),
        handler: function (array $args): string {
            if ($error = brane_validate($args, ['content'])) {
                return $error;
            }

            $content = trim($args['content']);
            $domain = brane_arg($args, 'domain') ?: brane_detect_domain(getcwd() ?: '');
            $project = brane_arg($args, 'project') ?: brane_detect_project(getcwd() ?: '');
            $type = brane_arg($args, 'type', 'document');
            $tags = brane_arg($args, 'tags', [], 'array');
            $contentHash = hash('sha256', $content);

            // Check for duplicate
            $existing = BraneDB::fetchOne(
                'SELECT id FROM memories WHERE content_hash = :hash AND domain = :domain LIMIT 1',
                ['hash' => $contentHash, 'domain' => $domain]
            );
            if ($existing) {
                return "Memory already exists (id: {$existing->id}). Content hash matches an existing entry.";
            }

            // Generate embedding
            $embedding = BraneEmbedder::embedDocument($content);
            if ($embedding === null) {
                return 'Error: Failed to generate embedding. Is Ollama running?';
            }
            $vectorStr = BraneEmbedder::toVector($embedding);

            // Build PostgreSQL text array literal
            $tagsLiteral = '{'.implode(',', array_map(fn ($t) => '"'.str_replace('"', '\\"', $t).'"', $tags)).'}';

            $agentId = BraneDB::agentId();

            $id = BraneDB::insertReturningId(
                'INSERT INTO memories (agent_id, content, embedding, metadata, memory_type, content_hash, domain, project, importance, tags, created_at, updated_at)
                 VALUES (:agent_id, :content, :embedding, :metadata, :type, :hash, :domain, :project, 0.5, :tags, NOW(), NOW())
                 RETURNING id',
                [
                    'agent_id' => $agentId,
                    'content' => $content,
                    'embedding' => $vectorStr,
                    'metadata' => json_encode(['source' => 'brane_store']),
                    'type' => $type,
                    'hash' => $contentHash,
                    'domain' => $domain,
                    'project' => $project,
                    'tags' => $tagsLiteral,
                ]
            );

            $domainStr = $domain ? " [{$domain}]" : '';
            $projectStr = $project ? " ({$project})" : '';
            $tagStr = $tags ? ' tags: '.implode(', ', $tags) : '';

            return "Stored memory (id: {$id}){$domainStr}{$projectStr}{$tagStr}";
        },
    ),
];
