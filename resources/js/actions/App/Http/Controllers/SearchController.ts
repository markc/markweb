import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/searchx',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
export const autocomplete = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: autocomplete.url(options),
    method: 'get',
})

autocomplete.definition = {
    methods: ["get","head"],
    url: '/api/searchx/autocomplete',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
autocomplete.url = (options?: RouteQueryOptions) => {
    return autocomplete.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
autocomplete.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: autocomplete.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
autocomplete.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: autocomplete.url(options),
    method: 'head',
})

const SearchController = { search, autocomplete }

export default SearchController