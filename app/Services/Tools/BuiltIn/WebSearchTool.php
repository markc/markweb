<?php

namespace App\Services\Tools\BuiltIn;

use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\SearchService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
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
        return 'Search the web using multiple search engines (Brave, DuckDuckGo, Google, Bing). Returns aggregated results with titles, URLs, and snippets.';
    }

    public function handle(Request $request): string
    {
        $query = $request['query'] ?? '';
        $maxResults = min((int) ($request['max_results'] ?? 8), 15);
        $category = $request['category'] ?? 'general';

        if (empty($query)) {
            return 'Error: query parameter is required.';
        }

        try {
            $service = app(SearchService::class);
            $searchRequest = new SearchRequest(
                query: $query,
                category: $category,
            );

            $results = $service->search($searchRequest);

            if (empty($results->results)) {
                return 'No results found.';
            }

            $formatted = [];
            foreach (array_slice($results->results, 0, $maxResults) as $i => $result) {
                $num = $i + 1;
                $engines = implode(', ', $result->engines);
                $formatted[] = "[{$num}] {$result->title}\n    {$result->url}\n    {$result->content}\n    (from: {$engines})";
            }

            $engineList = implode(', ', array_keys($results->engines));

            return "Search results for: {$query}\nEngines: {$engineList} ({$results->totalTime}s)\n\n".implode("\n\n", $formatted);
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
                ->description('Maximum number of results to return (1-15, default 8)'),
            'category' => $schema->string()
                ->description('Search category: general, images, or videos (default: general)'),
        ];
    }
}
