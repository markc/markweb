<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Node Permission Matrix
    |--------------------------------------------------------------------------
    |
    | Per-node permissions for mesh task dispatch. The 'default' key is the
    | fallback for unconfigured nodes.
    |
    */

    'node_permissions' => [
        'default' => [
            'allowed_types' => ['prompt', 'memory_search', 'embed'],
            'denied_types' => ['tool'],
            'trust_level' => 'standard',
            'max_concurrent_tasks' => 5,
        ],

        // Example per-node override:
        // 'mmc' => [
        //     'allowed_types' => ['prompt', 'memory_search', 'embed', 'tool'],
        //     'denied_types' => [],
        //     'trust_level' => 'elevated',
        //     'max_concurrent_tasks' => 10,
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Destructive Patterns
    |--------------------------------------------------------------------------
    |
    | Regex patterns scanned on remote task prompts. Local tasks are exempt.
    |
    */

    'destructive_patterns' => [
        '/\brm\s+(-rf?|--recursive)\b/i',
        '/\bdrop\s+(table|database|schema)\b/i',
        '/\bsudo\b/i',
        '/\bmigrate:fresh\b/i',
        '/\bmigrate:reset\b/i',
        '/\btruncate\b/i',
        '/\bdd\s+if=/i',
        '/\bmkfs\b/i',
        '/\bshutdown\b/i',
        '/\breboot\b/i',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limits
    |--------------------------------------------------------------------------
    |
    | Maximum tasks per node per minute.
    |
    */

    'rate_limits' => [
        'tasks_per_minute' => 30,
    ],
];
