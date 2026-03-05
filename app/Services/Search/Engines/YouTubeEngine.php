<?php

namespace App\Services\Search\Engines;

use App\Services\Search\Contracts\SearchEngine;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\DTOs\SearchResult;
use Illuminate\Http\Client\Response;

class YouTubeEngine implements SearchEngine
{
    public function name(): string
    {
        return 'youtube';
    }

    public function categories(): array
    {
        return ['videos'];
    }

    public function supports(string $feature): bool
    {
        return false;
    }

    public function buildRequest(SearchRequest $request): array
    {
        return [
            'method' => 'GET',
            'url' => 'https://www.youtube.com/results?'.http_build_query([
                'search_query' => $request->query,
            ]),
            'options' => [
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept-Language' => 'en-US,en;q=0.9',
                    'Cookie' => 'CONSENT=YES+',
                ],
            ],
        ];
    }

    public function parseResponse(Response $response, SearchRequest $request): array
    {
        $body = $response->body();
        $results = [];
        $position = 1;

        if (! preg_match('/var ytInitialData\s*=\s*({.*?});/', $body, $matches)) {
            return [];
        }

        $data = json_decode($matches[1], true);
        if (! $data) {
            return [];
        }

        $contents = $data['contents']['twoColumnSearchResultsRenderer']['primaryContents']
            ['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'] ?? [];

        foreach ($contents as $item) {
            $video = $item['videoRenderer'] ?? null;
            if (! $video) {
                continue;
            }

            $videoId = $video['videoId'] ?? '';
            if (! $videoId) {
                continue;
            }

            $title = $video['title']['runs'][0]['text'] ?? '';
            $snippet = '';
            foreach ($video['detailedMetadataSnippets'] ?? [] as $meta) {
                foreach ($meta['snippetText']['runs'] ?? [] as $run) {
                    $snippet .= $run['text'] ?? '';
                }
            }

            $thumbnail = $video['thumbnail']['thumbnails'][0]['url'] ?? null;

            $results[] = new SearchResult(
                url: "https://www.youtube.com/watch?v={$videoId}",
                title: $title,
                content: $snippet,
                template: 'video',
                thumbnail: $thumbnail,
                engine: $this->name(),
                position: $position++,
            );

            if ($position > 10) {
                break;
            }
        }

        return $results;
    }
}
