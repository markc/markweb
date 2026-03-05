import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\JmapAuthController::connect
* @see app/Http/Controllers/JmapAuthController.php:17
* @route '/api/jmap/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/api/jmap/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\JmapAuthController::connect
* @see app/Http/Controllers/JmapAuthController.php:17
* @route '/api/jmap/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\JmapAuthController::connect
* @see app/Http/Controllers/JmapAuthController.php:17
* @route '/api/jmap/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
export const session = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: session.url(options),
    method: 'get',
})

session.definition = {
    methods: ["get","head"],
    url: '/api/jmap/session',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
session.url = (options?: RouteQueryOptions) => {
    return session.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
session.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: session.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
session.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: session.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\JmapAuthController::disconnect
* @see app/Http/Controllers/JmapAuthController.php:85
* @route '/api/jmap/disconnect'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

disconnect.definition = {
    methods: ["post"],
    url: '/api/jmap/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\JmapAuthController::disconnect
* @see app/Http/Controllers/JmapAuthController.php:85
* @route '/api/jmap/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\JmapAuthController::disconnect
* @see app/Http/Controllers/JmapAuthController.php:85
* @route '/api/jmap/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

const JmapAuthController = { connect, session, disconnect }

export default JmapAuthController