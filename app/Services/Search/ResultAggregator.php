<?php

namespace App\Services\Search;

use App\Services\Search\DTOs\AggregatedResults;
use App\Services\Search\DTOs\SearchResult;

class ResultAggregator
{
    /** @var array<string, SearchResult> URL hash => merged result */
    private array $resultMap = [];

    private array $suggestions = [];

    private array $engineTimings = [];

    public function __construct(
        private readonly array $engineWeights = [],
    ) {}

    public function addResults(array $results, string $engine, float $responseTime): void
    {
        $this->engineTimings[$engine] = $responseTime;

        foreach ($results as $result) {
            if (! $result instanceof SearchResult || ! $result->url) {
                continue;
            }

            $hash = $result->urlHash();

            if (isset($this->resultMap[$hash])) {
                $this->resultMap[$hash]->mergeWith($result);
            } else {
                $this->resultMap[$hash] = $result;
            }
        }
    }

    public function addSuggestions(array $suggestions): void
    {
        $this->suggestions = array_unique(array_merge($this->suggestions, $suggestions));
    }

    public function aggregate(): AggregatedResults
    {
        $this->calculateScores();

        $results = array_values($this->resultMap);
        usort($results, fn (SearchResult $a, SearchResult $b) => $b->score <=> $a->score);

        return new AggregatedResults(
            results: $results,
            suggestions: $this->suggestions,
            engines: $this->engineTimings,
            totalTime: ! empty($this->engineTimings) ? max($this->engineTimings) : 0,
            totalResults: count($results),
        );
    }

    private function calculateScores(): void
    {
        foreach ($this->resultMap as $result) {
            $result->score = $this->calculateScore($result);
        }
    }

    /**
     * Scoring formula (SearXNG-style):
     * score = weight * num_engines * sum(1/position)
     */
    private function calculateScore(SearchResult $result): float
    {
        $weight = 1.0;

        foreach ($result->engines as $engine) {
            $weight *= $this->engineWeights[$engine] ?? 1.0;
        }

        $weight *= count($result->positions);

        $score = 0;
        foreach ($result->positions as $position) {
            if ($position > 0) {
                $score += $weight / $position;
            }
        }

        return $score;
    }
}
