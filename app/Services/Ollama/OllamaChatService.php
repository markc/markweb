<?php

namespace App\Services\Ollama;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OllamaChatService
{
    protected ?string $hostOverride = null;

    /**
     * Set a runtime host override (for multi-instance selection).
     */
    public function useHost(string $url): static
    {
        $this->hostOverride = rtrim($url, '/');

        return $this;
    }

    /**
     * Synchronous chat — returns the complete response text.
     */
    public function chat(string $model, array $messages, ?string $system = null): string
    {
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
        ];

        if ($system) {
            array_unshift($payload['messages'], [
                'role' => 'system',
                'content' => $system,
            ]);
        }

        $response = Http::timeout(120)
            ->post($this->baseUrl().'/api/chat', $payload);

        if ($response->failed()) {
            $body = $response->json();
            $error = $body['error'] ?? "HTTP {$response->status()}";

            throw new \RuntimeException("Ollama error: {$error}");
        }

        $text = $response->json('message.content', '');

        return $this->stripThinking($text);
    }

    /**
     * Streaming chat — calls $onToken for each chunk, returns stats.
     *
     * @return array{text: string, eval_count: int, tokens_per_sec: float}
     */
    public function streamChat(string $model, array $messages, callable $onToken, ?string $system = null): array
    {
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ];

        if ($system) {
            array_unshift($payload['messages'], [
                'role' => 'system',
                'content' => $system,
            ]);
        }

        $url = $this->baseUrl().'/api/chat';

        $response = Http::timeout(120)
            ->withOptions(['stream' => true])
            ->post($url, $payload);

        if ($response->failed()) {
            $body = $response->json();
            $error = $body['error'] ?? "HTTP {$response->status()}";

            throw new \RuntimeException("Ollama error: {$error}");
        }

        $fullText = '';
        $evalCount = 0;
        $tokensPerSec = 0.0;
        $inThinking = false;

        $body = $response->toPsrResponse()->getBody();

        $buffer = '';
        while (! $body->eof()) {
            $chunk = $body->read(8192);
            $buffer .= $chunk;

            // Process complete NDJSON lines
            while (($pos = strpos($buffer, "\n")) !== false) {
                $line = substr($buffer, 0, $pos);
                $buffer = substr($buffer, $pos + 1);

                $line = trim($line);
                if ($line === '') {
                    continue;
                }

                $data = json_decode($line, true);
                if (! is_array($data)) {
                    continue;
                }

                if ($data['done'] ?? false) {
                    $evalCount = $data['eval_count'] ?? 0;
                    $evalDuration = $data['eval_duration'] ?? 0;
                    if ($evalDuration > 0) {
                        $tokensPerSec = $evalCount / ($evalDuration / 1e9);
                    }

                    continue;
                }

                $token = $data['message']['content'] ?? '';
                if ($token === '') {
                    continue;
                }

                // Filter out <think>...</think> blocks from Qwen models
                if (str_contains($token, '<think>')) {
                    $inThinking = true;

                    continue;
                }
                if ($inThinking) {
                    if (str_contains($token, '</think>')) {
                        $inThinking = false;
                    }

                    continue;
                }

                $fullText .= $token;
                $onToken($token);
            }
        }

        return [
            'text' => trim($fullText),
            'eval_count' => $evalCount,
            'tokens_per_sec' => round($tokensPerSec, 1),
        ];
    }

    /**
     * Get available chat models from Ollama (excludes embedding models).
     *
     * @return array<string, string> Model ID => display name
     */
    public function getAvailableModels(?string $host = null): array
    {
        $url = $host ? rtrim($host, '/') : $this->baseUrl();

        try {
            $response = Http::timeout(5)->get($url.'/api/tags');
            $response->throw();
        } catch (\Throwable $e) {
            Log::warning('OllamaChatService: failed to fetch models', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return [];
        }

        return $this->parseModelList($response->json('models', []));
    }

    /**
     * Check if an Ollama instance is available.
     */
    public function isAvailable(?string $host = null): bool
    {
        $url = $host ? rtrim($host, '/') : $this->baseUrl();

        try {
            $response = Http::timeout(3)->get($url.'/api/tags');

            return $response->successful();
        } catch (ConnectionException) {
            return false;
        }
    }

    /**
     * Get all configured Ollama hosts and their reachability.
     *
     * @return array<string, array{url: string, label: string, available: bool}>
     */
    public function getHosts(): array
    {
        $hosts = config('agent.ollama_hosts', []);
        $result = [];

        foreach ($hosts as $key => $host) {
            $result[$key] = [
                'url' => $host['url'],
                'label' => $host['label'],
                'available' => $this->isAvailable($host['url']),
            ];
        }

        return $result;
    }

    /**
     * Check if a model is a code-specialized model (not suited for long system prompts).
     */
    public static function isCodeModel(string $model): bool
    {
        return (bool) preg_match('/coder|codellama|starcoder|deepseek-coder/i', $model);
    }

    protected function baseUrl(): string
    {
        if ($this->hostOverride) {
            return $this->hostOverride;
        }

        return rtrim(config('agent.ollama_host', config('memory.ollama_host')), '/');
    }

    protected function parseModelList(array $rawModels): array
    {
        $models = [];
        $skipPatterns = ['embed', 'nomic-embed'];

        foreach ($rawModels as $model) {
            $name = $model['name'] ?? '';
            if ($name === '') {
                continue;
            }

            $lower = strtolower($name);
            $skip = false;
            foreach ($skipPatterns as $pattern) {
                if (str_contains($lower, $pattern)) {
                    $skip = true;
                    break;
                }
            }
            if ($skip) {
                continue;
            }

            $size = isset($model['size']) ? $this->formatSize($model['size']) : '';
            $tag = str_contains($lower, 'coder') ? 'code' : 'chat';
            $displayName = $name.($size ? " ({$size}, {$tag})" : " ({$tag})");
            $models[$name] = $displayName;
        }

        return $models;
    }

    /**
     * Strip <think>...</think> blocks from complete response text.
     */
    protected function stripThinking(string $text): string
    {
        return trim(preg_replace('/<think>.*?<\/think>/s', '', $text));
    }

    protected function formatSize(int $bytes): string
    {
        if ($bytes >= 1_000_000_000) {
            return round($bytes / 1_000_000_000, 1).' GB';
        }

        return round($bytes / 1_000_000).' MB';
    }
}
