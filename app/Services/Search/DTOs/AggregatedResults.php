<?php

namespace App\Services\Search\DTOs;

class AggregatedResults
{
    public function __construct(
        public array $results = [],
        public array $suggestions = [],
        public array $engines = [],
        public float $totalTime = 0,
        public int $totalResults = 0,
    ) {}

    public function toArray(): array
    {
        return [
            'results' => array_map(fn (SearchResult $r) => $r->toArray(), $this->results),
            'suggestions' => $this->suggestions,
            'engines' => $this->engines,
            'total_time' => round($this->totalTime, 3),
            'total_results' => $this->totalResults,
        ];
    }
}
