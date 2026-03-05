<?php

namespace App\Services\Search;

use App\Services\Search\Contracts\SearchEngine;

class EngineRegistry
{
    /** @var array<string, SearchEngine> */
    private array $engines = [];

    public function register(SearchEngine $engine): void
    {
        $this->engines[$engine->name()] = $engine;
    }

    public function get(string $name): ?SearchEngine
    {
        return $this->engines[$name] ?? null;
    }

    /**
     * @return SearchEngine[]
     */
    public function forCategory(string $category): array
    {
        return array_filter($this->engines, function (SearchEngine $engine) use ($category) {
            $config = config("searchx.engines.{$engine->name()}");
            if (! $config || ! ($config['enabled'] ?? false)) {
                return false;
            }

            return in_array($category, $engine->categories());
        });
    }

    /** @return SearchEngine[] */
    public function all(): array
    {
        return $this->engines;
    }
}
