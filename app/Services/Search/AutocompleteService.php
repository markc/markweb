<?php

namespace App\Services\Search;

use Illuminate\Support\Facades\Http;

class AutocompleteService
{
    public function suggest(string $query): array
    {
        try {
            $response = Http::timeout(2)
                ->get('https://suggestqueries.google.com/complete/search', [
                    'client' => 'firefox',
                    'q' => $query,
                ]);

            if (! $response->successful()) {
                return [];
            }

            $data = $response->json();

            return $data[1] ?? [];
        } catch (\Throwable) {
            return [];
        }
    }
}
