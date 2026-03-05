<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use Illuminate\Http\Client\Response;

class BraveApiEngine implements SearchEngine
{
    private const API_URL = 'https://api.search.brave.com/res/v1/web/search';

    private const TIME_RANGE_MAP = [
        'day' => 'pd',
        'week' => 'pw',
        'month' => 'pm',
        'year' => 'py',
    ];

    public function name(): string
    {
        return 'brave';
    }

    public function categories(): array
    {
        return ['general'];
    }

    public function supports(string $feature): bool
    {
        return in_array($feature, ['paging', 'time_range', 'safesearch']);
    }

    public function buildRequest(SearchRequest $request): array
    {
        $params = [
            'q' => $request->query,
            'count' => config('searchx.defaults.results_per_page', 10),
            'offset' => ($request->page - 1) * config('searchx.defaults.results_per_page', 10),
        ];

        if ($request->timeRange && isset(self::TIME_RANGE_MAP[$request->timeRange])) {
            $params['freshness'] = self::TIME_RANGE_MAP[$request->timeRange];
        }

        if ($request->safesearch > 0) {
            $params['safesearch'] = 'strict';
        }

        return [
            'method' => 'GET',
            'url' => self::API_URL.'?'.http_build_query($params),
            'options' => [
                'headers' => [
                    'Accept' => 'application/json',
                    'Accept-Encoding' => 'gzip',
                    'X-Subscription-Token' => config('searchx.engines.brave.api_key'),
                ],
            ],
        ];
    }

    public function parseResponse(Response $response, SearchRequest $request): array
    {
        $data = $response->json();
        $results = [];
        $position = 1;

        foreach ($data['web']['results'] ?? [] as $item) {
            $results[] = new SearchResult(
                url: $item['url'] ?? '',
                title: $item['title'] ?? '',
                content: $item['description'] ?? '',
                engine: $this->name(),
                position: $position++,
                thumbnail: $item['thumbnail']['src'] ?? null,
                publishedDate: $this->parseDate($item['age'] ?? null),
            );
        }

        return $results;
    }

    private function parseDate(?string $dateStr): ?string
    {
        if (! $dateStr) {
            return null;
        }

        try {
            return (new \DateTimeImmutable($dateStr))->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }
}
