<?php

namespace App\Services\Search\DTOs;

class SearchRequest
{
    public function __construct(
        public readonly string $query,
        public readonly string $category = 'general',
        public readonly int $page = 1,
        public readonly int $safesearch = 0,
        public readonly ?string $timeRange = null,
    ) {}

    public static function fromArray(array $data): static
    {
        return new static(
            query: $data['q'] ?? $data['query'] ?? '',
            category: $data['category'] ?? 'general',
            page: (int) ($data['page'] ?? 1),
            safesearch: (int) ($data['safesearch'] ?? 0),
            timeRange: $data['time_range'] ?? null,
        );
    }
}
