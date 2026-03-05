<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Services\Agent\ModelRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function __construct(
        protected ModelRegistry $modelRegistry,
    ) {}

    /**
     * GET /workspace/agents — List user's agents.
     */
    public function index(Request $request)
    {
        $agents = Agent::where('user_id', $request->user()->id)
            ->orWhereNull('user_id')
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('workspace/agents/index', [
            'agents' => $agents,
        ]);
    }

    /**
     * GET /workspace/agents/create — Agent creation form.
     */
    public function create()
    {
        return Inertia::render('workspace/agents/create', [
            'availableModels' => $this->modelRegistry->getAvailableModels(),
        ]);
    }

    /**
     * POST /workspace/agents — Store new agent.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'model' => 'required|string',
            'provider' => 'required|string',
            'temperature' => 'numeric|min:0|max:2',
            'top_p' => 'numeric|min:0|max:1',
            'system_prompt' => 'nullable|string|max:10000',
        ]);

        $agent = Agent::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'model' => $validated['model'],
            'provider' => $validated['provider'],
            'temperature' => $validated['temperature'] ?? 0.7,
            'top_p' => $validated['top_p'] ?? 1.0,
            'prompt_overrides' => isset($validated['system_prompt'])
                ? ['system' => $validated['system_prompt']]
                : null,
        ]);

        return redirect()->route('agents.index');
    }

    /**
     * GET /workspace/agents/{agent}/edit — Agent edit form.
     */
    public function edit(Agent $agent, Request $request)
    {
        if ($agent->user_id && $agent->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('workspace/agents/edit', [
            'agent' => $agent,
            'availableModels' => $this->modelRegistry->getAvailableModels(),
        ]);
    }

    /**
     * PUT /workspace/agents/{agent} — Update agent.
     */
    public function update(Request $request, Agent $agent)
    {
        if ($agent->user_id && $agent->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'model' => 'required|string',
            'provider' => 'required|string',
            'temperature' => 'numeric|min:0|max:2',
            'top_p' => 'numeric|min:0|max:1',
            'system_prompt' => 'nullable|string|max:10000',
        ]);

        $agent->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'model' => $validated['model'],
            'provider' => $validated['provider'],
            'temperature' => $validated['temperature'] ?? 0.7,
            'top_p' => $validated['top_p'] ?? 1.0,
            'prompt_overrides' => isset($validated['system_prompt'])
                ? ['system' => $validated['system_prompt']]
                : null,
        ]);

        return redirect()->route('agents.index');
    }

    /**
     * DELETE /workspace/agents/{agent} — Delete agent.
     */
    public function destroy(Request $request, Agent $agent)
    {
        if ($agent->user_id !== $request->user()->id) {
            abort(403);
        }

        $agent->delete();

        return redirect()->route('agents.index');
    }
}
