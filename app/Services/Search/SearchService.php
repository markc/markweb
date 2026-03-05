<?php

namespace App\Services\Search;

use App\Services\Search\DTOs\AggregatedResults;
use App\Services\Search\DTOs\SearchRequest;
use Illuminate\Support\Facades\Http;

class SearchService
{
    public function __construct(
        private readonly EngineRegistry $registry,
    ) {}

    public function search(SearchRequest $request): AggregatedResults
    {
        $engines = $this->registry->forCategory($request->category);

        if (empty($engines)) {
            return new AggregatedResults;
        }

        $weights = [];
        foreach ($engines as $engine) {
            $weights[$engine->name()] = config("searchx.engines.{$engine->name()}.weight", 1.0);
        }

        $aggregator = new ResultAggregator($weights);

        $engineRequests = [];
        foreach ($engines as $engine) {
            $engineRequests[$engine->name()] = $engine->buildRequest($request);
        }

        $responses = Http::pool(function ($pool) use ($engineRequests) {
            foreach ($engineRequests as $name => $req) {
                $timeout = config("searchx.engines.{$name}.timeout", 5);
                $pendingRequest = $pool->as($name)
                    ->timeout($timeout)
                    ->connectTimeout(3)
                    ->withHeaders($req['options']['headers'] ?? []);

                if ($req['method'] === 'POST') {
                    $pendingRequest->asForm()->post($req['url'], $req['options']['form_params'] ?? []);
                } else {
                    $pendingRequest->get($req['url']);
                }
            }
        });

        foreach ($engines as $engine) {
            $name = $engine->name();

            if (! isset($responses[$name]) || $responses[$name] instanceof \Throwable) {
                continue;
            }

            $response = $responses[$name];

            if (! $response->successful()) {
                continue;
            }

            $startTime = microtime(true);

            try {
                $results = $engine->parseResponse($response, $request);
                $parseTime = microtime(true) - $startTime;
                $aggregator->addResults($results, $name, $parseTime);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return $aggregator->aggregate();
    }
}
