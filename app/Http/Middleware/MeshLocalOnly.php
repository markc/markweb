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
        $ip = $request->ip();

        // Accept localhost
        if (in_array($ip, ['127.0.0.1', '::1'], true)) {
            return $next($request);
        }

        // Accept WireGuard mesh subnet (172.16.2.x)
        if (str_starts_with($ip, '172.16.2.')) {
            return $next($request);
        }

        abort(403, 'Mesh inbound only accepts local/WireGuard connections');

        return $next($request);
    }
}
