<?php

namespace App\Services\Agent;

use App\DTOs\IncomingMessage;
use App\Models\Agent;
use App\Models\AgentSession;

class SessionResolver
{
    public function resolve(IncomingMessage $message): AgentSession
    {
        // Mesh tasks can override trust level via metadata
        $trustLevel = ($message->channel === 'mesh' && isset($message->metadata['trust_level']))
            ? $message->metadata['trust_level']
            : config("channels.{$message->channel}.trust_level", 'standard');

        $session = AgentSession::firstOrCreate(
            ['session_key' => $message->sessionKey],
            [
                'agent_id' => $this->resolveAgent($message)->id,
                'user_id' => $message->userId,
                'title' => 'New Chat',
                'channel' => $message->channel,
                'trust_level' => $trustLevel,
                'model' => $message->model,
                'provider' => $message->provider,
                'system_prompt' => $message->systemPrompt,
            ]
        );

        // Sync provider/model if the message overrides them (e.g. /model switch in TUI)
        $updates = [];
        if ($message->provider && $session->provider !== $message->provider) {
            $updates['provider'] = $message->provider;
        }
        if ($message->model && $session->model !== $message->model) {
            $updates['model'] = $message->model;
        }
        if (! empty($updates)) {
            $session->update($updates);
        }

        return $session;
    }

    public function resolveOrFail(string $sessionKey): AgentSession
    {
        return AgentSession::where('session_key', $sessionKey)->firstOrFail();
    }

    protected function resolveAgent(IncomingMessage $message): Agent
    {
        // Support explicit agent_id from metadata (e.g., from agent selector in UI)
        if (isset($message->metadata['agent_id'])) {
            $agent = Agent::find($message->metadata['agent_id']);
            if ($agent) {
                return $agent;
            }
        }

        return Agent::where('is_default', true)->first()
            ?? Agent::firstOrCreate(
                ['slug' => 'default'],
                [
                    'name' => 'Default Agent',
                    'slug' => 'default',
                    'model' => config('agent.default_model'),
                    'provider' => config('agent.default_provider'),
                    'is_default' => true,
                ]
            );
    }
}
