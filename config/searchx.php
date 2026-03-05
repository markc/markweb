<?php

return [
    'engines' => [
        'brave' => [
            'enabled' => env('SEARCHX_ENGINE_BRAVE', true),
            'weight' => 1.0,
            'timeout' => 5,
            'api_key' => env('BRAVE_API_KEY'),
            'categories' => ['general'],
        ],
        'duckduckgo' => [
            'enabled' => env('SEARCHX_ENGINE_DUCKDUCKGO', true),
            'weight' => 1.0,
            'timeout' => 5,
            'categories' => ['general'],
        ],
        'google' => [
            'enabled' => env('SEARCHX_ENGINE_GOOGLE', false),
            'weight' => 1.2,
            'timeout' => 5,
            'categories' => ['general'],
        ],
        'bing' => [
            'enabled' => env('SEARCHX_ENGINE_BING', false),
            'weight' => 1.0,
            'timeout' => 5,
            'categories' => ['general'],
        ],
        'youtube' => [
            'enabled' => env('SEARCHX_ENGINE_YOUTUBE', false),
            'weight' => 1.0,
            'timeout' => 5,
            'categories' => ['videos'],
        ],
        'google_images' => [
            'enabled' => env('SEARCHX_ENGINE_GOOGLE_IMAGES', false),
            'weight' => 1.0,
            'timeout' => 5,
            'categories' => ['images'],
        ],
    ],

    'defaults' => [
        'safesearch' => 0,
        'results_per_page' => 10,
        'max_page' => 10,
    ],

    'user_agents' => [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    ],
];
