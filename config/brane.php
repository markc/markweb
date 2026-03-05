<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Domain Configuration
    |--------------------------------------------------------------------------
    |
    | Defines the two knowledge domains Brane indexes: gh (GitHub projects)
    | and ns (NetServa ops). Each domain has a base path and glob patterns
    | for files to index.
    |
    */

    'domains' => [
        'gh' => [
            'base_path' => env('BRANE_GH_PATH', (getenv('HOME') ?: ($_SERVER['HOME'] ?? '/home/markc')).'/.gh'),
            'patterns' => [
                '_journal/*.md',
                '_notes.md',
                '*/CLAUDE.md',
                '*/_doc/*.md',
                '*/_notes.md',
                '*/_journal/*.md',
            ],
        ],
        'ns' => [
            'base_path' => env('BRANE_NS_PATH', (getenv('HOME') ?: ($_SERVER['HOME'] ?? '/home/markc')).'/.ns'),
            'patterns' => [
                'CLAUDE.md',
                '_doc/*.md',
                '*/_notes.md',
                '*/_journal/*.md',
                '*/*/*/_notes.md',
                '*/*/*/_journal/*.md',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Chunking Configuration
    |--------------------------------------------------------------------------
    */

    'chunking' => [
        'min_size' => 500,
        'max_size' => 4000,
        'primary_separator' => "\n---\n",
        'secondary_separator' => "\n## ",
        'tertiary_separator' => "\n### ",
    ],

    /*
    |--------------------------------------------------------------------------
    | Embedding Configuration
    |--------------------------------------------------------------------------
    */

    'embedding' => [
        'model' => env('BRANE_EMBEDDING_MODEL', 'nomic-embed-text'),
        'host' => env('BRANE_OLLAMA_HOST', 'http://127.0.0.1:11434'),
        'dimensions' => 768,
        'max_content_length' => 4000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Search Configuration
    |--------------------------------------------------------------------------
    |
    | Three-factor scoring: semantic similarity + recency decay + keyword match.
    | RRF (Reciprocal Rank Fusion) merges vector and keyword result lists.
    |
    */

    'search' => [
        'vector_weight' => 0.5,
        'keyword_weight' => 0.2,
        'recency_weight' => 0.3,
        'rrf_k' => 60,
        'recency_decay_rate' => 0.995,
        'candidate_multiplier' => 3,
        'default_limit' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Configuration (standalone MCP server)
    |--------------------------------------------------------------------------
    |
    | Used by brane-mcp.php which runs outside Laravel.
    | Laravel integration uses the default database connection.
    |
    */

    'db' => [
        'dsn' => env('BRANE_DB_DSN', 'pgsql:host=127.0.0.1;dbname=markweb'),
        'user' => env('BRANE_DB_USER', 'markweb'),
        'pass' => env('BRANE_DB_PASS', 'markweb_cachyos_2026'),
    ],

];
