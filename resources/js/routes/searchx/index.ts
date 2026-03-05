import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::search
* @see app/Http/Controllers/SearchController.php:13
* @route '/api/searchx'
*/
searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

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

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
const autocompleteForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: autocomplete.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
autocompleteForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: autocomplete.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SearchController::autocomplete
* @see app/Http/Controllers/SearchController.php:28
* @route '/api/searchx/autocomplete'
*/
autocompleteForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: autocomplete.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

autocomplete.form = autocompleteForm

const searchx = {
    search: Object.assign(search, search),
    autocomplete: Object.assign(autocomplete, autocomplete),
}

export default searchx