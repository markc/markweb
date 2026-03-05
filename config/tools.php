<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trust Level Policies
    |--------------------------------------------------------------------------
    | Define which tools are available at each trust level.
    | Tool names must match the name() method on each Tool class.
    */

    'policies' => [
        'operator' => [
            'allowed' => ['*'],
            'denied' => [],
            'sandbox' => 'none',
        ],
        'standard' => [
            'allowed' => ['current_datetime', 'http_request', 'web_search'],
            'denied' => ['bash'],
            'sandbox' => 'restricted',
        ],
        'restricted' => [
            'allowed' => ['current_datetime'],
            'denied' => ['*'],
            'sandbox' => 'docker',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Web Search (Brave Search API)
    |--------------------------------------------------------------------------
    */

    'web_search' => [
        'api_key' => env('BRAVE_SEARCH_API_KEY'),
        'max_results' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Sandbox Settings
    |--------------------------------------------------------------------------
    */

    'sandbox' => [
        'timeout' => env('TOOL_SANDBOX_TIMEOUT', 30),
        'memory_limit' => env('TOOL_SANDBOX_MEMORY', '256m'),
    ],

];
