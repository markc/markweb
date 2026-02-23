<?php

namespace App\Http\Controllers;

use App\Models\AgentMessage;
use App\Models\AgentSession;
use App\Models\SystemPromptTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $providers = [
            'anthropic' => ['name' => 'Anthropic', 'configured' => !empty(config('ai.providers.anthropic.key'))],
            'openai' => ['name' => 'OpenAI', 'configured' => !empty(config('ai.providers.openai.key'))],
            'gemini' => ['name' => 'Google Gemini', 'configured' => !empty(config('ai.providers.gemini.key'))],
        ];

        $settings = [
            'default_model' => $user->setting('default_model', 'claude-sonnet-4-5-20250929'),
            'default_system_prompt' => $user->setting('default_system_prompt', ''),
        ];

        $templates = SystemPromptTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->orderByRaw('user_id IS NULL')
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard', [
            // Defer heavy stats queries — page shell renders instantly
            'stats' => Inertia::defer(function () use ($user) {
                $sessionIds = AgentSession::where('user_id', $user->id)->pluck('id');
                $totalSessions = $sessionIds->count();
                $totalMessages = AgentMessage::whereIn('session_id', $sessionIds)->count();

                return [
                    'sessions' => $totalSessions,
                    'messages' => $totalMessages,
                    'input_tokens' => 0,
                    'output_tokens' => 0,
                    'total_cost' => 0,
                    'costByModel' => [],
                ];
            }),
            'providers' => $providers,
            'settings' => $settings,
            'templates' => $templates,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'default_model' => 'nullable|string',
            'default_system_prompt' => 'nullable|string|max:5000',
        ]);

        $user = Auth::user();

        foreach (['default_model', 'default_system_prompt'] as $key) {
            if ($request->has($key)) {
                $user->settings()->updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->input($key)],
                );
            }
        }

        return back();
    }
}
