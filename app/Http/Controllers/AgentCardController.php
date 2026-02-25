<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Mesh\AgentCardBuilder;
use Illuminate\Http\JsonResponse;

class AgentCardController extends Controller
{
    public function show(AgentCardBuilder $builder): JsonResponse
    {
        return response()->json($builder->build());
    }
}
