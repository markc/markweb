<?php

declare(strict_types=1);

/**
 * brane_recall — "What do I know about X?" — search + format as coherent summary.
 */

return [
    'brane_recall' => new Tool(
        description: 'Recall what Brane knows about a topic. Returns a formatted summary of relevant memories. Use this when you need context like "what do I know about project X?" or "what happened with Y?"',
        inputSchema: schema([
            'topic' => prop('string', 'The topic to recall knowledge about'),
            'domain' => prop('string', 'Filter by domain: "gh" or "ns"', ['enum' => ['gh', 'ns']]),
            'limit' => prop('integer', 'Max memories to include (default: 5)'),
        ], ['topic']),
        handler: function (array $args): string {
            if ($error = brane_validate($args, ['topic'])) {
                return $error;
            }

            $topic = trim($args['topic']);
            $domain = brane_arg($args, 'domain') ?: null;
            $limit = brane_arg($args, 'limit', 5, 'int');

            $config = brane_config()['search'];
            $k = $config['rrf_k'];
            $vectorWeight = $config['vector_weight'];
            $keywordWeight = $config['keyword_weight'];
            $recencyWeight = $config['recency_weight'];
            $decayRate = $config['recency_decay_rate'];
            $candidateLimit = $limit * $config['candidate_multiplier'];

            // Build WHERE clause
            $where = 'WHERE embedding IS NOT NULL';
            $params = [];
            if ($domain) {
                $where .= ' AND domain = :domain';
                $params['domain'] = $domain;
            }

            // Vector search
            $embedding = BraneEmbedder::embedQuery($topic);
            $vectorResults = [];
            if ($embedding !== null) {
                $vectorStr = BraneEmbedder::toVector($embedding);
                $rows = BraneDB::query(
                    "SELECT id, embedding <=> '{$vectorStr}'::vector AS distance
                     FROM memories {$where}
                     ORDER BY embedding <=> '{$vectorStr}'::vector
                     LIMIT {$candidateLimit}",
                    $params
                );
                foreach ($rows as $rank => $row) {
                    $vectorResults[$row->id] = $rank + 1;
                }
            }

            // Keyword search
            $kwParams = array_merge(['query' => $topic], $params);
            $rows = BraneDB::query(
                "SELECT id, ts_rank_cd(content_tsv, plainto_tsquery('english', :query)) AS rank_score
                 FROM memories {$where} AND content_tsv @@ plainto_tsquery('english', :query)
                 ORDER BY rank_score DESC
                 LIMIT {$candidateLimit}",
                $kwParams
            );
            $keywordResults = [];
            foreach ($rows as $rank => $row) {
                $keywordResults[$row->id] = $rank + 1;
            }

            $allIds = array_unique(array_merge(array_keys($vectorResults), array_keys($keywordResults)));
            if (empty($allIds)) {
                return "I don't have any memories about: {$topic}";
            }

            // Fetch full content
            $placeholders = implode(',', array_map(fn ($i) => ':id'.$i, range(0, count($allIds) - 1)));
            $metaParams = [];
            foreach (array_values($allIds) as $i => $id) {
                $metaParams['id'.$i] = $id;
            }
            $metas = [];
            foreach (BraneDB::query(
                "SELECT id, content, source_file, memory_type, domain, project, created_at,
                        EXTRACT(EPOCH FROM (NOW() - COALESCE(created_at, NOW()))) / 86400.0 AS age_days
                 FROM memories WHERE id IN ({$placeholders})",
                $metaParams
            ) as $row) {
                $metas[$row->id] = $row;
            }

            // RRF with recency
            $scores = [];
            foreach ($allIds as $id) {
                $score = 0.0;
                if (isset($vectorResults[$id])) {
                    $score += $vectorWeight / ($k + $vectorResults[$id]);
                }
                if (isset($keywordResults[$id])) {
                    $score += $keywordWeight / ($k + $keywordResults[$id]);
                }
                if (isset($metas[$id])) {
                    $ageDays = max(0, (float) $metas[$id]->age_days);
                    $score += $recencyWeight * pow($decayRate, $ageDays);
                }
                $scores[$id] = $score;
            }

            arsort($scores);
            $topIds = array_slice(array_keys($scores), 0, $limit, true);

            // Update access metadata
            $updateIds = implode(',', $topIds);
            BraneDB::execute(
                "UPDATE memories SET retrieval_count = retrieval_count + 1, last_accessed = NOW() WHERE id IN ({$updateIds})"
            );

            // Format as coherent summary
            $lines = ["Here's what I know about \"{$topic}\":\n"];
            $num = 1;
            foreach ($topIds as $id) {
                $meta = $metas[$id] ?? null;
                if (! $meta) {
                    continue;
                }

                $source = $meta->source_file ? brane_relative_path($meta->source_file) : 'stored memory';
                $date = $meta->created_at ? substr($meta->created_at, 0, 10) : 'unknown';
                $domainLabel = $meta->domain ? "[{$meta->domain}]" : '';
                $content = trim($meta->content);

                // Truncate very long content but keep it useful
                if (mb_strlen($content) > 500) {
                    $content = mb_substr($content, 0, 497).'...';
                }

                $lines[] = "{$num}. {$domainLabel} ({$date}, from: {$source})";
                $lines[] = $content;
                $lines[] = '';
                $num++;
            }

            return implode("\n", $lines);
        },
    ),
];
