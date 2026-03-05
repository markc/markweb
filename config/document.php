<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Docparse Binary Path
    |--------------------------------------------------------------------------
    */

    'docparse_binary' => env('DOCPARSE_BINARY', '/home/markc/.gh/nodemesh/target/release/docparse'),

    /*
    |--------------------------------------------------------------------------
    | Chunking
    |--------------------------------------------------------------------------
    */

    'chunk_size' => (int) env('DOCUMENT_CHUNK_SIZE', 1500),
    'chunk_overlap' => (int) env('DOCUMENT_CHUNK_OVERLAP', 200),

    /*
    |--------------------------------------------------------------------------
    | Upload Limits
    |--------------------------------------------------------------------------
    */

    'max_file_size' => (int) env('DOCUMENT_MAX_FILE_SIZE', 50 * 1024 * 1024), // 50MB

    'allowed_mimes' => [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'message/rfc822',
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/json',
        'text/html',
        'application/xml',
    ],

];
