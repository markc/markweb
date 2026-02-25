<?php

declare(strict_types=1);

namespace App\Services\Mesh;

use App\Services\Agent\ModelRegistry;
use App\Services\Memory\EmbeddingService;

class AgentCardBuilder
{
    public function __construct(
        protected ModelRegistry $modelRegistry,
        protected EmbeddingService $embeddingService,
    ) {}

    public function build(): array
    {
        return [
            'name' => config('mesh.node_name', 'unknown'),
            'description' => config('mesh.agent_card.description', 'markweb mesh agent node'),
            'url' => config('mesh.node_url', config('app.url')),
            'version' => '1.0',
            'authentication' => [
                'schemes' => ['bearer'],
            ],
            'skills' => $this->buildSkills(),
            'models' => $this->buildModels(),
            'meta' => [
                'wg_ip' => config('mesh.node_wg_ip'),
                'embedding_model' => config('memory.embedding_model'),
            ],
        ];
    }

    protected function buildSkills(): array
    {
        $skills = [
            [
                'id' => 'prompt',
                'name' => 'LLM Prompt',
                'description' => 'Send a prompt to an LLM and receive a response',
            ],
            [
                'id' => 'embed',
                'name' => 'Text Embedding',
                'description' => 'Generate vector embeddings for text',
            ],
        ];

        if ($this->embeddingService->isAvailable()) {
            $skills[] = [
                'id' => 'memory_search',
                'name' => 'Memory Search',
                'description' => 'Hybrid vector + keyword search over agent memories',
            ];
        }

        $tools = $this->getAvailableToolNames();
        if (! empty($tools)) {
            $skills[] = [
                'id' => 'tool',
                'name' => 'Tool Execution',
                'description' => 'Execute tools (available: '.implode(', ', $tools).')',
            ];
        }

        return $skills;
    }

    protected function buildModels(): array
    {
        return $this->modelRegistry->getAvailableModelsList();
    }

    protected function getAvailableToolNames(): array
    {
        $registry = [
            'current_datetime',
            'http_request',
            'bash',
        ];

        return $registry;
    }
}
