<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use App\Services\Search\Engines\Concerns\ParsesHtml;
use Illuminate\Http\Client\Response;

class DuckDuckGoEngine implements SearchEngine
{
    use ParsesHtml;

    public function name(): string
    {
        return 'duckduckgo';
    }

    public function categories(): array
    {
        return ['general'];
    }

    public function supports(string $feature): bool
    {
        return in_array($feature, ['safesearch']);
    }

    public function buildRequest(SearchRequest $request): array
    {
        $params = [
            'q' => $request->query,
            'b' => '',
            'kl' => '',
        ];

        if ($request->safesearch > 0) {
            $params['kp'] = '1';
        }

        return [
            'method' => 'POST',
            'url' => 'https://html.duckduckgo.com/html/',
            'options' => [
                'form_params' => $params,
                'headers' => [
                    'User-Agent' => $this->randomUserAgent(),
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
            ],
        ];
    }

    public function parseResponse(Response $response, SearchRequest $request): array
    {
        $xpath = $this->createXpath($response->body());
        $nodes = $xpath->query('//div[contains(@class, "result__body")]');
        $results = [];
        $position = 1;

        if (! $nodes) {
            return [];
        }

        foreach ($nodes as $node) {
            $linkNode = $xpath->query('.//a[contains(@class, "result__a")]', $node)->item(0);
            $snippetNode = $xpath->query('.//a[contains(@class, "result__snippet")]', $node)->item(0);

            if (! $linkNode) {
                continue;
            }

            $url = $this->extractAttribute($linkNode, 'href') ?? '';
            if (str_contains($url, 'uddg=')) {
                parse_str(parse_url($url, PHP_URL_QUERY) ?? '', $params);
                $url = urldecode($params['uddg'] ?? $url);
            }

            if (! $url || ! str_starts_with($url, 'http')) {
                continue;
            }

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
