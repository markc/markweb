<?php

return [
    'node_name' => env('MESH_NODE_NAME'),
    'node_wg_ip' => env('MESH_NODE_WG_IP'),
    'primary_url' => env('MESH_PRIMARY_URL'),
    'node_url' => env('MESH_NODE_URL'),

    'agent_card' => [
        'description' => env('MESH_AGENT_DESCRIPTION', 'markweb mesh agent node'),
    ],
];
