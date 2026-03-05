<?php

namespace App\Services\Tools\BuiltIn;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class WebSearchTool implements Tool
{
    public function name(): string
    {
        return 'web_search';
    }

    public function description(): string
    {
        return 'Search the web for current information using Brave Search. Returns titles, URLs, and snippets for the top results.';
    }

    public function handle(Request $request): string
    {
        $query = $request['query'] ?? '';
        $maxResults = min((int) ($request['max_results'] ?? 5), 10);

        if (empty($query)) {
            return 'Error: query parameter is required.';
        }

        $apiKey = config('tools.web_search.api_key');
        if (empty($apiKey)) {
            return 'Error: Brave Search API key not configured.';
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-Subscription-Token' => $apiKey,
                    'Accept' => 'application/json',
                ])
                ->get('https://api.search.brave.com/res/v1/web/search', [
                    'q' => $query,
                    'count' => $maxResults,
                ]);

            if (! $response->successful()) {
                return "Error: Brave Search API returned HTTP {$response->status()}";
            }

            $data = $response->json();
            $results = $data['web']['results'] ?? [];

            if (empty($results)) {
                return 'No results found.';
            }

            $formatted = [];
            foreach (array_slice($results, 0, $maxResults) as $i => $result) {
                $num = $i + 1;
                $title = $result['title'] ?? 'Untitled';
                $url = $result['url'] ?? '';
                $description = $result['description'] ?? '';

                $formatted[] = "{$num}. {$title}\n   URL: {$url}\n   {$description}";
            }

            return implode("\n\n", $formatted);
        } catch (\Throwable $e) {
            return 'Error: '.$e->getMessage();
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('The search query')
                ->required(),
            'max_results' => $schema->number()
                ->description('Maximum number of results to return (1-10, default 5)'),
        ];
    }
}
