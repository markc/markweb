<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use App\Services\Search\Engines\Concerns\ParsesHtml;
use Illuminate\Http\Client\Response;

class GoogleImagesEngine implements SearchEngine
{
    use ParsesHtml;

    public function name(): string
    {
        return 'google_images';
    }

    public function categories(): array
    {
        return ['images'];
    }

    public function supports(string $feature): bool
    {
        return in_array($feature, ['safesearch']);
    }

    public function buildRequest(SearchRequest $request): array
    {
        $params = [
            'q' => $request->query,
            'tbm' => 'isch',
            'hl' => 'en',
            'gl' => 'us',
        ];

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
        $body = $response->body();
        $results = [];
        $position = 1;

        if (preg_match_all('/\["(https?:\/\/[^"]+)",(\d+),(\d+)\]/', $body, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $url = $match[1];

                if (str_contains($url, 'google.com') || str_contains($url, 'gstatic.com')) {
                    continue;
                }

                $results[] = new SearchResult(
                    url: $url,
                    title: '',
                    template: 'image',
                    imgSrc: $url,
                    engine: $this->name(),
                    position: $position++,
                );

                if ($position > 20) {
                    break;
                }
            }
        }

        return $results;
    }
}
