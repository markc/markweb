<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default AI Provider & Model
    |--------------------------------------------------------------------------
    */

    'default_provider' => env('AI_DEFAULT_PROVIDER', 'anthropic'),
    'default_model' => env('AI_DEFAULT_MODEL', 'claude-sonnet-4-5-20250929'),

    /*
    |--------------------------------------------------------------------------
    | Available Models (grouped by provider)
    |--------------------------------------------------------------------------
    | Only providers with configured API keys will appear in the UI.
    */

    'models' => [
        'anthropic' => [
            'claude-sonnet-4-5-20250929' => 'Claude Sonnet 4.5',
            'claude-haiku-4-5-20251001' => 'Claude Haiku 4.5',
            'claude-opus-4-6' => 'Claude Opus 4.6',
        ],
        'openai' => [
            'gpt-4o' => 'GPT-4o',
            'gpt-4o-mini' => 'GPT-4o Mini',
            'o3-mini' => 'o3 Mini',
        ],
        'gemini' => [
            'gemini-3.1-pro-preview' => 'Gemini 3.1 Pro',
            'gemini-2.5-pro' => 'Gemini 2.5 Pro',
            'gemini-2.0-flash' => 'Gemini 2.0 Flash',
            'gemini-2.0-pro' => 'Gemini 2.0 Pro',
        ],
        'groq' => [
            'llama-3.3-70b-versatile' => 'Llama 3.3 70B',
            'mixtral-8x7b-32768' => 'Mixtral 8x7B',
        ],
        'xai' => [
            'grok-2' => 'Grok 2',
            'grok-2-mini' => 'Grok 2 Mini',
        ],
        'deepseek' => [
            'deepseek-chat' => 'DeepSeek Chat',
            'deepseek-reasoner' => 'DeepSeek Reasoner',
        ],
        'openrouter' => [
            'anthropic/claude-sonnet-4-5' => 'Claude Sonnet 4.5 (OR)',
            'openai/gpt-4o' => 'GPT-4o (OR)',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider API Key Environment Variables
    |--------------------------------------------------------------------------
    */

    'provider_keys' => [
        'anthropic' => env('ANTHROPIC_API_KEY'),
        'openai' => env('OPENAI_API_KEY'),
        'gemini' => env('GEMINI_API_KEY'),
        'groq' => env('GROQ_API_KEY'),
        'xai' => env('XAI_API_KEY'),
        'deepseek' => env('DEEPSEEK_API_KEY'),
        'openrouter' => env('OPENROUTER_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Workspace
    |--------------------------------------------------------------------------
    */

    'ollama_host' => env('OLLAMA_HOST', 'http://192.168.2.130:11434'),

    'ollama_hosts' => [
        'local' => [
            'url' => 'http://127.0.0.1:11434',
            'label' => 'Local (cachyos)',
        ],
        'pve3' => [
            'url' => 'http://192.168.2.130:11434',
            'label' => 'pve3 (i9-13900H)',
        ],
    ],

    'workspace_path' => storage_path('app/agent'),

    /*
    |--------------------------------------------------------------------------
    | Session Defaults
    |--------------------------------------------------------------------------
    */

    'max_conversation_messages' => 100,
    'compaction_threshold_tokens' => 50000,
    'auto_title_after_messages' => 1,

    /*
    |--------------------------------------------------------------------------
    | Pricing (per 1M tokens: [input, output])
    |--------------------------------------------------------------------------
    */

    'pricing' => [
        'claude-sonnet-4-5-20250929' => [3.00, 15.00],
        'claude-haiku-4-5-20251001' => [1.00, 5.00],
        'claude-opus-4-6' => [5.00, 25.00],
        'gpt-4o' => [2.50, 10.00],
        'gpt-4o-mini' => [0.15, 0.60],
        'o3-mini' => [1.10, 4.40],
        'gemini-3.1-pro-preview' => [2.00, 12.00],
        'gemini-2.5-pro' => [1.25, 10.00],
        'gemini-2.0-flash' => [0.10, 0.40],
        'gemini-2.0-pro' => [1.25, 10.00],
        'llama-3.3-70b-versatile' => [0.59, 0.79],
        'mixtral-8x7b-32768' => [0.24, 0.24],
        'grok-2' => [2.00, 10.00],
        'grok-2-mini' => [0.30, 0.50],
        'deepseek-chat' => [0.14, 0.28],
        'deepseek-reasoner' => [0.55, 2.19],
    ],

];
