<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only accept requests from localhost.
 *
 * meshd always calls back on 127.0.0.1 — reject anything else.
 */
class MeshLocalOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! in_array($request->ip(), ['127.0.0.1', '::1'], true)) {
            abort(403, 'Mesh inbound only accepts localhost connections');
        }

        return $next($request);
    }
}
