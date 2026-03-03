<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only accept requests from localhost or this node's own WireGuard IP.
 *
 * meshd calls back via either 127.0.0.1 (direct) or the node's
 * public/WG IP (when routed through a reverse proxy like Caddy).
 */
class MeshLocalOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowed = ['127.0.0.1', '::1'];

        // Also accept this node's own WireGuard IP (meshd callback via HTTPS proxy)
        $wgIp = config('mesh.node_wg_ip');
        if ($wgIp) {
            $allowed[] = $wgIp;
        }

        if (! in_array($request->ip(), $allowed, true)) {
            abort(403, 'Mesh inbound only accepts local connections');
        }

        return $next($request);
    }
}
