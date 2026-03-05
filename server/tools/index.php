<?php

declare(strict_types=1);

/**
 * brane_index — Batch index a file or directory into Brane.
 */

return [
    'brane_index' => new Tool(
        description: 'Index a file or directory into Brane. Chunks markdown files, generates embeddings, and stores them. Skips unchanged files unless force=true. Use this to populate Brane with project knowledge.',
        inputSchema: schema([
            'path' => prop('string', 'Absolute path to a file or directory to index'),
            'domain' => prop('string', 'Knowledge domain: "gh" or "ns". Auto-detected from path if omitted.', ['enum' => ['gh', 'ns']]),
            'force' => prop('boolean', 'Re-index even if file hash unchanged (default: false)'),
        ], ['path']),
        handler: function (array $args): string {
            if ($error = brane_validate($args, ['path'])) {
                return $error;
            }

            $path = $args['path'];
            $home = getenv('HOME') ?: '/home/markc';

            // Expand ~ to home directory
            if (str_starts_with($path, '~/')) {
                $path = $home.substr($path, 1);
            }

            // Resolve to absolute path
            $path = realpath($path) ?: $path;

            if (! file_exists($path)) {
                return "Error: Path does not exist: {$path}";
            }

            $domain = brane_arg($args, 'domain') ?: brane_detect_domain($path);
            $force = brane_arg($args, 'force', false, 'bool');

            // Collect files
            $files = [];
            if (is_dir($path)) {
                // Glob for *.md files recursively
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS)
                );
                foreach ($iterator as $file) {
                    if ($file->isFile() && strtolower($file->getExtension()) === 'md') {
                        $files[] = $file->getPathname();
                    }
                }
                sort($files);
            } else {
                $files[] = $path;
            }

            if (empty($files)) {
                return "No markdown files found in: {$path}";
            }

            $agentId = BraneDB::agentId();
            $indexed = 0;
            $chunksCreated = 0;
            $skipped = 0;
            $errors = 0;
            $details = [];

            foreach ($files as $filePath) {
                $content = file_get_contents($filePath);
                if ($content === false || trim($content) === '') {
                    $skipped++;

                    continue;
                }

                $fileHash = hash('sha256', $content);
                $relativePath = brane_relative_path($filePath);
                $project = brane_detect_project($filePath);
                $fileDomain = $domain ?: brane_detect_domain($filePath);
                $memoryType = str_contains($filePath, '_journal/') ? 'daily_note' : 'file';

                // Check brane_sources for unchanged files
                if (! $force) {
                    $existing = BraneDB::fetchOne(
                        'SELECT id FROM brane_sources WHERE file_path = :path AND file_hash = :hash',
                        ['path' => $filePath, 'hash' => $fileHash]
                    );
                    if ($existing) {
                        $skipped++;

                        continue;
                    }
                }

                // Chunk content
                $chunks = BraneChunker::chunk($content);
                $chunkCount = count($chunks);

                // Delete existing memories for this source file
                BraneDB::execute(
                    'DELETE FROM memories WHERE source_file = :sf',
                    ['sf' => $relativePath]
                );

                $fileErrors = false;
                foreach ($chunks as $ci => $chunk) {
                    $embedding = BraneEmbedder::embedDocument($chunk['content']);
                    if ($embedding === null) {
                        $errors++;
                        $fileErrors = true;

                        continue;
                    }

                    $vectorStr = BraneEmbedder::toVector($embedding);
                    $metadata = json_encode(array_filter([
                        'source' => 'brane_index',
                        'chunk_index' => $ci,
                        'chunk_count' => $chunkCount,
                        'chunk_title' => $chunk['title'],
                    ], fn ($v) => $v !== null));

                    BraneDB::execute(
                        'INSERT INTO memories (agent_id, content, embedding, metadata, memory_type, source_file, content_hash, domain, project, created_at, updated_at)
                         VALUES (:agent_id, :content, :embedding, :metadata, :type, :source, :hash, :domain, :project, NOW(), NOW())',
                        [
                            'agent_id' => $agentId,
                            'content' => $chunk['content'],
                            'embedding' => $vectorStr,
                            'metadata' => $metadata,
                            'type' => $memoryType,
                            'source' => $relativePath,
                            'hash' => $fileHash,
                            'domain' => $fileDomain,
                            'project' => $project,
                        ]
                    );
                }

                // Update brane_sources tracking
                BraneDB::execute(
                    'INSERT INTO brane_sources (file_path, domain, project, file_hash, chunks_count, last_indexed, created_at, updated_at)
                     VALUES (:path, :domain, :project, :hash, :chunks, NOW(), NOW(), NOW())
                     ON CONFLICT (file_path) DO UPDATE SET
                         file_hash = EXCLUDED.file_hash,
                         chunks_count = EXCLUDED.chunks_count,
                         last_indexed = NOW(),
                         updated_at = NOW()',
                    [
                        'path' => $filePath,
                        'domain' => $fileDomain,
                        'project' => $project,
                        'hash' => $fileHash,
                        'chunks' => $chunkCount,
                    ]
                );

                if (! $fileErrors) {
                    $indexed++;
                    $chunksCreated += $chunkCount;
                    $details[] = "{$relativePath} ({$chunkCount} chunks)";
                }
            }

            $lines = ["Indexing complete:\n"];
            $lines[] = "Files indexed: {$indexed}";
            $lines[] = "Chunks created: {$chunksCreated}";
            $lines[] = "Skipped (unchanged): {$skipped}";
            if ($errors > 0) {
                $lines[] = "Errors: {$errors}";
            }
            if ($details) {
                $lines[] = "\nIndexed files:";
                foreach ($details as $d) {
                    $lines[] = "  - {$d}";
                }
            }

            return implode("\n", $lines);
        },
    ),
];
