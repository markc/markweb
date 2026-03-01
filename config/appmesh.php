<?php

return [
    'enabled' => env('APPMESH_ENABLED', true),

    // Path to the appmesh project root (for FFI and MCP tools)
    'project_root' => env('APPMESH_PROJECT_ROOT', base_path('../appmesh')),

    // Path to the shared library (auto-detected if null)
    'lib_path' => env('APPMESH_LIB_PATH'),

    // Which MCP plugins to expose in the UI
    'plugins' => ['dbus', 'osc', 'tts', 'cdp', 'midi', 'config'],

    // API endpoint for the standalone AppMesh web UI (diagnostic tool)
    'api_url' => env('APPMESH_API_URL', 'http://localhost:8420'),
];
