<?php

namespace App\Http\Controllers;

use App\Services\Search\AutocompleteService;
use App\Services\Search\DTOs\SearchRequest;
use App\Services\Search\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request, SearchService $service): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:1|max:500',
            'category' => 'in:general,images,videos',
            'page' => 'integer|min:1|max:10',
            'time_range' => 'nullable|in:day,week,month,year',
        ]);

        $searchRequest = SearchRequest::fromArray($request->all());
        $results = $service->search($searchRequest);

        return response()->json($results->toArray());
    }

    public function autocomplete(Request $request, AutocompleteService $service): JsonResponse
    {
        $query = $request->input('q', '');
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        return response()->json($service->suggest($query));
    }
}
