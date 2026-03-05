<?php

namespace App\Services\Agent;

use App\Services\Ollama\OllamaChatService;

class ModelRegistry
{
    public function __construct(
        protected OllamaChatService $ollamaChatService,
    ) {}

    /**
     * Get available models grouped by provider.
     * Only includes providers with configured API keys (+ Ollama if reachable).
     */
    public function getAvailableModels(): array
    {
        $allModels = config('agent.models', []);
        $providerKeys = config('agent.provider_keys', []);
        $available = [];

        foreach ($allModels as $provider => $models) {
            $apiKey = $providerKeys[$provider] ?? null;

            if (! empty($apiKey)) {
                $available[$provider] = collect($models)->map(fn ($name, $id) => [
                    'id' => $id,
                    'name' => $name,
                    'provider' => $provider,
                ])->values()->all();
            }
        }

        // Add Ollama models if service is reachable
        $ollamaModels = $this->getOllamaModels();
        if (! empty($ollamaModels)) {
            $available['ollama'] = $ollamaModels;
        }

        return $available;
    }

    /**
     * Get a flat list of all available models.
     */
    public function getAvailableModelsList(): array
    {
        $grouped = $this->getAvailableModels();
        $flat = [];

        foreach ($grouped as $models) {
            foreach ($models as $model) {
                $flat[] = $model;
            }
        }

        return $flat;
    }

    /**
     * Resolve provider for a given model ID.
     */
    public function resolveProvider(string $modelId): ?string
    {
        foreach (config('agent.models', []) as $provider => $models) {
            if (array_key_exists($modelId, $models)) {
                return $provider;
            }
        }

        // Check Ollama models
        $ollamaModels = $this->ollamaChatService->getAvailableModels();
        if (array_key_exists($modelId, $ollamaModels)) {
            return 'ollama';
        }

        return null;
    }

    /**
     * Get Ollama models formatted for the registry.
     */
    public function getOllamaModels(): array
    {
        $models = $this->ollamaChatService->getAvailableModels();

        return collect($models)->map(fn ($name, $id) => [
            'id' => $id,
            'name' => $name,
            'provider' => 'ollama',
        ])->values()->all();
    }
}
