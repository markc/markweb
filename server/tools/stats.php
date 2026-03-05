<?php

declare(strict_types=1);

/**
 * brane_stats — Memory overview by domain/project/type.
 */

return [
    'brane_stats' => new Tool(
        description: 'Show Brane memory statistics: totals by domain, project, and type. Use this to understand what knowledge Brane has accumulated.',
        inputSchema: schema([
            'domain' => prop('string', 'Filter stats to a specific domain: "gh" or "ns"', ['enum' => ['gh', 'ns']]),
        ]),
        handler: function (array $args): string {
            $domain = brane_arg($args, 'domain') ?: null;

            $where = '';
            $params = [];
            if ($domain) {
                $where = 'WHERE domain = :domain';
                $params['domain'] = $domain;
            }

            // Total memories
            $total = BraneDB::fetchOne("SELECT COUNT(*) as cnt FROM memories {$where}", $params);
            $totalCount = $total->cnt ?? 0;

            // With embeddings
            $embedded = BraneDB::fetchOne(
                "SELECT COUNT(*) as cnt FROM memories {$where}".($where ? ' AND' : ' WHERE').' embedding IS NOT NULL',
                $params
            );
            $embeddedCount = $embedded->cnt ?? 0;

            // By domain
            $byDomain = BraneDB::query(
                "SELECT COALESCE(domain, '(none)') as domain, COUNT(*) as cnt FROM memories GROUP BY domain ORDER BY cnt DESC"
            );

            // By project (top 15)
            $projectWhere = $where ?: '';
            $byProject = BraneDB::query(
                "SELECT COALESCE(project, '(cross-project)') as project, COUNT(*) as cnt
                 FROM memories {$projectWhere}
                 GROUP BY project ORDER BY cnt DESC LIMIT 15",
                $params
            );

            // By type
            $byType = BraneDB::query(
                "SELECT memory_type, COUNT(*) as cnt FROM memories {$where} GROUP BY memory_type ORDER BY cnt DESC",
                $params
            );

            // Indexed sources
            $sourceWhere = $domain ? 'WHERE domain = :domain' : '';
            $sourceCount = BraneDB::fetchOne(
                "SELECT COUNT(*) as cnt FROM brane_sources {$sourceWhere}",
                $domain ? ['domain' => $domain] : []
            );
            $sourcesTotal = $sourceCount->cnt ?? 0;

            // Recent activity: last 5 indexed files
            $recentSources = BraneDB::query(
                "SELECT file_path, chunks_count, last_indexed FROM brane_sources {$sourceWhere}
                 ORDER BY last_indexed DESC LIMIT 5",
                $domain ? ['domain' => $domain] : []
            );

            // Recent activity: last 5 accessed memories
            $recentAccessed = BraneDB::query(
                'SELECT id, SUBSTRING(content, 1, 80) as excerpt, source_file, last_accessed, retrieval_count
                 FROM memories WHERE last_accessed IS NOT NULL
                 ORDER BY last_accessed DESC LIMIT 5'
            );

            // Format output
            $lines = ["=== Brane Memory Statistics ===\n"];
            $domainLabel = $domain ? " [{$domain}]" : '';
            $lines[] = "Total memories{$domainLabel}: {$totalCount}";
            $lines[] = "With embeddings: {$embeddedCount}";
            $lines[] = "Indexed sources: {$sourcesTotal}";

            $lines[] = "\n--- By Domain ---";
            foreach ($byDomain as $row) {
                $lines[] = "  {$row->domain}: {$row->cnt}";
            }

            $lines[] = "\n--- By Project (top 15) ---";
            foreach ($byProject as $row) {
                $lines[] = "  {$row->project}: {$row->cnt}";
            }

            $lines[] = "\n--- By Type ---";
            foreach ($byType as $row) {
                $lines[] = "  {$row->memory_type}: {$row->cnt}";
            }

            if ($recentSources) {
                $lines[] = "\n--- Recently Indexed ---";
                foreach ($recentSources as $row) {
                    $relPath = brane_relative_path($row->file_path);
                    $date = substr($row->last_indexed, 0, 16);
                    $lines[] = "  {$relPath} ({$row->chunks_count} chunks, {$date})";
                }
            }

            if ($recentAccessed) {
                $lines[] = "\n--- Recently Accessed ---";
                foreach ($recentAccessed as $row) {
                    $excerpt = str_replace("\n", ' ', $row->excerpt);
                    $date = substr($row->last_accessed, 0, 16);
                    $lines[] = "  #{$row->id} (x{$row->retrieval_count}, {$date}): {$excerpt}";
                }
            }

            return implode("\n", $lines);
        },
    ),
];
