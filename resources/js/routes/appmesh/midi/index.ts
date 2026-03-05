import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AppMeshController::ports
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
export const ports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ports.url(options),
    method: 'get',
})

ports.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/midi/ports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::ports
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
ports.url = (options?: RouteQueryOptions) => {
    return ports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::ports
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
ports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ports
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
ports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ports.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::connect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/api/appmesh/midi/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::connect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::connect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

