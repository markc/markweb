<?php

namespace App\Http\Controllers;

use App\Models\AgentSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SharedChatController extends Controller
{
    /**
     * POST /chat/{agentSession}/share — Generate a share token.
     */
    public function share(Request $request, AgentSession $agentSession): JsonResponse
    {
        $this->authorize('update', $agentSession);

        if (! $agentSession->share_token) {
            $agentSession->update(['share_token' => Str::random(48)]);
        }

        return response()->json([
            'share_url' => route('shared-chat.show', $agentSession->share_token),
            'share_token' => $agentSession->share_token,
        ]);
    }

    /**
     * DELETE /chat/{agentSession}/share — Revoke the share token.
     */
    public function unshare(Request $request, AgentSession $agentSession): JsonResponse
    {
        $this->authorize('update', $agentSession);

        $agentSession->update(['share_token' => null]);

        return response()->json(['status' => 'unshared']);
    }

    /**
     * GET /s/{token} — Public read-only view of a shared chat.
     */
    public function show(string $token)
    {
        $session = AgentSession::where('share_token', $token)
            ->with('messages')
            ->firstOrFail();

        return Inertia::render('shared-chat', [
            'session' => [
                'title' => $session->title,
                'model' => $session->model,
                'messages' => $session->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'role' => $m->role,
                    'content' => $m->content,
                    'created_at' => $m->created_at->toISOString(),
                ]),
            ],
        ]);
    }
}
