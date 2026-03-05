<?php

namespace App\Services\Search\Contracts;

use App\Services\Search\DTOs\SearchRequest;
use Illuminate\Http\Client\Response;

interface SearchEngine
{
    public function name(): string;

    public function categories(): array;

    public function supports(string $feature): bool;

    /**
     * @return array{method: string, url: string, options: array}
     */
    public function buildRequest(SearchRequest $request): array;

    /**
     * @return \App\Services\Search\DTOs\SearchResult[]
     */
    public function parseResponse(Response $response, SearchRequest $request): array;
}
