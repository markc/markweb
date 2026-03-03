<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Mesh\MeshNodeCache;
use Illuminate\Http\JsonResponse;

class MeshController extends Controller
{
    /**
     * List all mesh nodes from Redis cache.
     */
    public function nodes(MeshNodeCache $cache): JsonResponse
    {
        return response()->json($cache->all());
    }
}
