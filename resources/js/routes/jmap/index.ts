import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import blob from './blob'
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
* @see \App\Http\Controllers\JmapAuthController::connect
* @see app/Http/Controllers/JmapAuthController.php:17
* @route '/api/jmap/connect'
*/
const connectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\JmapAuthController::connect
* @see app/Http/Controllers/JmapAuthController.php:17
* @route '/api/jmap/connect'
*/
connectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

connect.form = connectForm

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
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
const sessionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: session.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
sessionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: session.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAuthController::session
* @see app/Http/Controllers/JmapAuthController.php:49
* @route '/api/jmap/session'
*/
sessionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: session.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

session.form = sessionForm

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

/**
* @see \App\Http\Controllers\JmapAuthController::disconnect
* @see app/Http/Controllers/JmapAuthController.php:85
* @route '/api/jmap/disconnect'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\JmapAuthController::disconnect
* @see app/Http/Controllers/JmapAuthController.php:85
* @route '/api/jmap/disconnect'
*/
disconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

disconnect.form = disconnectForm

const jmap = {
    connect: Object.assign(connect, connect),
    session: Object.assign(session, session),
    disconnect: Object.assign(disconnect, disconnect),
    blob: Object.assign(blob, blob),
}

export default jmap