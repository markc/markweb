<?php

declare(strict_types=1);

namespace App\Services\Mesh;

use App\DTOs\AmpMessage;
use Illuminate\Support\Facades\Http;

class MeshBridgeService
{
    protected string $socketPath;

    public function __construct()
    {
        $this->socketPath = config('mesh.meshd_socket', '/run/meshd/meshd.sock');
    }

    /**
     * Send an AMP message via meshd unix socket.
     *
     * Returns the message ID from X-Mesh-Id header.
     */
    public function send(AmpMessage $message): string
    {
        $response = Http::baseUrl('http://meshd')
            ->withOptions(['curl' => [CURLOPT_UNIX_SOCKET_PATH => $this->socketPath]])
            ->withBody($message->toWire(), 'text/x-amp')
            ->timeout(10)
            ->post('/send');

        return $response->header('X-Mesh-Id', '');
    }

    /**
     * Query meshd for peer status.
     *
     * Returns JSON array of peer states.
     */
    public function status(): array
    {
        $response = Http::baseUrl('http://meshd')
            ->withOptions(['curl' => [CURLOPT_UNIX_SOCKET_PATH => $this->socketPath]])
            ->timeout(5)
            ->get('/status');

        return $response->json() ?? [];
    }

    /**
     * Check if meshd socket is available.
     */
    public function isAvailable(): bool
    {
        return file_exists($this->socketPath);
    }
}
