<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use App\Services\Search\Engines\Concerns\ParsesHtml;
use Illuminate\Http\Client\Response;

class BingEngine implements SearchEngine
{
    use ParsesHtml;

    private const TIME_RANGE_MAP = [
        'day' => 'ex1:"ez1"',
        'week' => 'ex1:"ez2"',
        'month' => 'ex1:"ez3"',
    ];

    public function name(): string
    {
        return 'bing';
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
            'first' => (($request->page - 1) * 10) + 1,
        ];

        if ($request->timeRange && isset(self::TIME_RANGE_MAP[$request->timeRange])) {
            $params['filters'] = self::TIME_RANGE_MAP[$request->timeRange];
        }

        return [
            'method' => 'GET',
            'url' => 'https://www.bing.com/search?'.http_build_query($params),
            'options' => [
                'headers' => [
                    'User-Agent' => $this->randomUserAgent(),
                    'Accept' => 'text/html',
                    'Accept-Language' => 'en-US,en;q=0.9',
                ],
                'cookies' => [
                    'SRCHHPGUSR' => 'ADLT='.($request->safesearch > 0 ? 'STRICT' : 'OFF'),
                ],
            ],
        ];
    }

    public function parseResponse(Response $response, SearchRequest $request): array
    {
        $xpath = $this->createXpath($response->body());
        $results = [];
        $position = 1;

        $nodes = $xpath->query('//li[@class="b_algo"]');
        if (! $nodes) {
            return [];
        }

        foreach ($nodes as $node) {
            $linkNode = $xpath->query('.//h2/a', $node)->item(0);
            if (! $linkNode) {
                continue;
            }

            $url = $this->extractAttribute($linkNode, 'href') ?? '';
            if (! $url || ! str_starts_with($url, 'http')) {
                continue;
            }

            $snippetNode = $xpath->query('.//div[@class="b_caption"]//p', $node)->item(0);

            $results[] = new SearchResult(
                url: $url,
                title: $this->extractText($linkNode),
                content: $snippetNode ? $this->extractText($snippetNode) : '',
                engine: $this->name(),
                position: $position++,
            );
        }

        return $results;
    }
}
