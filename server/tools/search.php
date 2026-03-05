<?php

declare(strict_types=1);

/**
 * brane_search — Hybrid RRF search with recency decay.
 */

return [
    'brane_search' => new Tool(
        description: 'Search Brane memories using hybrid semantic + keyword search with recency decay. Returns ranked results with similarity scores.',
        inputSchema: schema([
            'query' => prop('string', 'Search query'),
            'domain' => prop('string', 'Filter by domain: "gh" or "ns"', ['enum' => ['gh', 'ns']]),
            'project' => prop('string', 'Filter by project name'),
            'type' => prop('string', 'Filter by memory type'),
            'limit' => prop('integer', 'Max results to return (default: 10)'),
        ], ['query']),
        handler: function (array $args): string {
            if ($error = brane_validate($args, ['query'])) {
                return $error;
            }

            $query = trim($args['query']);
            $domain = brane_arg($args, 'domain') ?: null;
            $project = brane_arg($args, 'project') ?: null;
            $type = brane_arg($args, 'type') ?: null;
            $limit = brane_arg($args, 'limit', 10, 'int');

            $config = brane_config()['search'];
            $k = $config['rrf_k'];
            $vectorWeight = $config['vector_weight'];
            $keywordWeight = $config['keyword_weight'];
            $recencyWeight = $config['recency_weight'];
            $decayRate = $config['recency_decay_rate'];
            $candidateLimit = $limit * $config['candidate_multiplier'];

            // Build WHERE clause for filters
            $where = 'WHERE embedding IS NOT NULL';
            $params = [];
            if ($domain) {
                $where .= ' AND domain = :domain';
                $params['domain'] = $domain;
            }
            if ($project) {
                $where .= ' AND project = :project';
                $params['project'] = $project;
            }
            if ($type) {
                $where .= ' AND memory_type = :type';
                $params['type'] = $type;
            }

            // --- Vector search ---
            $embedding = BraneEmbedder::embedQuery($query);
            $vectorResults = [];
            if ($embedding !== null) {
                $vectorStr = BraneEmbedder::toVector($embedding);
                $vectorSql = "SELECT id, embedding <=> '{$vectorStr}'::vector AS distance
                              FROM memories {$where}
                              ORDER BY embedding <=> '{$vectorStr}'::vector
                              LIMIT {$candidateLimit}";
                $rows = BraneDB::query($vectorSql, $params);
                foreach ($rows as $rank => $row) {
                    $vectorResults[$row->id] = $rank + 1;
                }
            }

            // --- Keyword search ---
            $keywordResults = [];
            $kwParams = array_merge(['query' => $query], $params);
            $keywordSql = "SELECT id, ts_rank_cd(content_tsv, plainto_tsquery('english', :query)) AS rank_score
                           FROM memories {$where} AND content_tsv @@ plainto_tsquery('english', :query)
                           ORDER BY rank_score DESC
                           LIMIT {$candidateLimit}";
            $rows = BraneDB::query($keywordSql, $kwParams);
            foreach ($rows as $rank => $row) {
                $keywordResults[$row->id] = $rank + 1;
            }

            // --- Recency scores ---
            $allIds = array_unique(array_merge(array_keys($vectorResults), array_keys($keywordResults)));
            if (empty($allIds)) {
                return "No results found for: {$query}";
            }

            // Fetch metadata for all candidates
            $placeholders = implode(',', array_map(fn ($i) => ':id'.$i, range(0, count($allIds) - 1)));
            $metaParams = [];
            foreach (array_values($allIds) as $i => $id) {
                $metaParams['id'.$i] = $id;
            }
            $metaSql = "SELECT id, content, source_file, memory_type, domain, project, importance,
                                retrieval_count, created_at, last_accessed,
                                EXTRACT(EPOCH FROM (NOW() - COALESCE(created_at, NOW()))) / 86400.0 AS age_days
                         FROM memories WHERE id IN ({$placeholders})";
            $metas = [];
            foreach (BraneDB::query($metaSql, $metaParams) as $row) {
                $metas[$row->id] = $row;
            }

            // --- RRF fusion with recency decay ---
            $scores = [];
            foreach ($allIds as $id) {
                $score = 0.0;

                // Vector component
                if (isset($vectorResults[$id])) {
                    $score += $vectorWeight / ($k + $vectorResults[$id]);
                }

                // Keyword component
                if (isset($keywordResults[$id])) {
                    $score += $keywordWeight / ($k + $keywordResults[$id]);
                }

                // Recency component
                if (isset($metas[$id])) {
                    $ageDays = max(0, (float) $metas[$id]->age_days);
                    $recencyScore = pow($decayRate, $ageDays);
                    $score += $recencyWeight * $recencyScore;
                }

                $scores[$id] = $score;
            }

            // Sort by score descending
            arsort($scores);
            $topIds = array_slice(array_keys($scores), 0, $limit, true);

            // Update access metadata
            $updateIds = implode(',', $topIds);
            BraneDB::execute(
                "UPDATE memories SET retrieval_count = retrieval_count + 1, last_accessed = NOW() WHERE id IN ({$updateIds})"
            );

            // Format results
            $lines = ['Found '.count($topIds)." results for: {$query}\n"];
            $rank = 1;
            foreach ($topIds as $id) {
                $meta = $metas[$id] ?? null;
                if (! $meta) {
                    continue;
                }

                $score = round($scores[$id] * 1000) / 1000;
                $source = $meta->source_file ? brane_relative_path($meta->source_file) : '(stored)';
                $domainLabel = $meta->domain ? "[{$meta->domain}]" : '';
                $projectLabel = $meta->project ? "({$meta->project})" : '';
                $excerpt = mb_substr(trim(str_replace("\n", ' ', $meta->content)), 0, 200);

                $lines[] = "{$rank}. {$domainLabel}{$projectLabel} score={$score} | {$source}";
                $lines[] = "   {$excerpt}";
                $lines[] = '';
                $rank++;
            }

            return implode("\n", $lines);
        },
    ),
];
