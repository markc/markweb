<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use App\Services\Search\Engines\Concerns\ParsesHtml;
use Illuminate\Http\Client\Response;

class GoogleEngine implements SearchEngine
{
    use ParsesHtml;

    private const TIME_RANGE_MAP = [
        'day' => 'qdr:d',
        'week' => 'qdr:w',
        'month' => 'qdr:m',
        'year' => 'qdr:y',
    ];

    public function name(): string
    {
        return 'google';
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
            'start' => ($request->page - 1) * 10,
            'hl' => 'en',
            'gl' => 'us',
        ];

        if ($request->timeRange && isset(self::TIME_RANGE_MAP[$request->timeRange])) {
            $params['tbs'] = self::TIME_RANGE_MAP[$request->timeRange];
        }

        if ($request->safesearch > 0) {
            $params['safe'] = 'active';
        }

        return [
            'method' => 'GET',
            'url' => 'https://www.google.com/search?'.http_build_query($params),
            'options' => [
                'headers' => [
                    'User-Agent' => $this->randomUserAgent(),
                    'Accept' => 'text/html',
                    'Accept-Language' => 'en-US,en;q=0.9',
                ],
            ],
        ];
    }

    public function parseResponse(Response $response, SearchRequest $request): array
    {
        $xpath = $this->createXpath($response->body());
        $results = [];
        $position = 1;

        $nodes = $xpath->query('//div[@class="g"] | //div[contains(@class, "tF2Cxc")]');
        if (! $nodes || $nodes->length === 0) {
            $nodes = $xpath->query('//div[@data-sokoban-container]');
        }

        if (! $nodes) {
            return [];
        }

        foreach ($nodes as $node) {
            $linkNode = $xpath->query('.//a[h3]', $node)->item(0)
                ?? $xpath->query('.//a', $node)->item(0);

            if (! $linkNode) {
                continue;
            }

            $url = $this->extractAttribute($linkNode, 'href') ?? '';
            if (! $url || ! str_starts_with($url, 'http')) {
                continue;
            }

            $titleNode = $xpath->query('.//h3', $node)->item(0);
            $snippetNode = $xpath->query('.//div[contains(@class, "VwiC3b")] | .//span[contains(@class, "aCOpRe")]', $node)->item(0);

            $results[] = new SearchResult(
                url: $url,
                title: $titleNode ? $this->extractText($titleNode) : '',
                content: $snippetNode ? $this->extractText($snippetNode) : '',
                engine: $this->name(),
                position: $position++,
            );
        }

        return $results;
    }
}
