import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/.well-known/agent.json',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentCardController::show
* @see app/Http/Controllers/AgentCardController.php:12
* @route '/.well-known/agent.json'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const AgentCardController = { show }

export default AgentCardController