import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MeshTaskController::dispatch
* @see app/Http/Controllers/MeshTaskController.php:22
* @route '/api/mesh/task/dispatch'
*/
export const dispatch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispatch.url(options),
    method: 'post',
})

dispatch.definition = {
    methods: ["post"],
    url: '/api/mesh/task/dispatch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MeshTaskController::dispatch
* @see app/Http/Controllers/MeshTaskController.php:22
* @route '/api/mesh/task/dispatch'
*/
dispatch.url = (options?: RouteQueryOptions) => {
    return dispatch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshTaskController::dispatch
* @see app/Http/Controllers/MeshTaskController.php:22
* @route '/api/mesh/task/dispatch'
*/
dispatch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshTaskController::dispatch
* @see app/Http/Controllers/MeshTaskController.php:22
* @route '/api/mesh/task/dispatch'
*/
const dispatchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dispatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshTaskController::dispatch
* @see app/Http/Controllers/MeshTaskController.php:22
* @route '/api/mesh/task/dispatch'
*/
dispatchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dispatch.url(options),
    method: 'post',
})

dispatch.form = dispatchForm

/**
* @see \App\Http\Controllers\MeshTaskController::callback
* @see app/Http/Controllers/MeshTaskController.php:73
* @route '/api/mesh/task/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: callback.url(options),
    method: 'post',
})

callback.definition = {
    methods: ["post"],
    url: '/api/mesh/task/callback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MeshTaskController::callback
* @see app/Http/Controllers/MeshTaskController.php:73
* @route '/api/mesh/task/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshTaskController::callback
* @see app/Http/Controllers/MeshTaskController.php:73
* @route '/api/mesh/task/callback'
*/
callback.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: callback.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshTaskController::callback
* @see app/Http/Controllers/MeshTaskController.php:73
* @route '/api/mesh/task/callback'
*/
const callbackForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: callback.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshTaskController::callback
* @see app/Http/Controllers/MeshTaskController.php:73
* @route '/api/mesh/task/callback'
*/
callbackForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: callback.url(options),
    method: 'post',
})

callback.form = callbackForm

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
export const status = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/api/mesh/task/{id}/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
status.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return status.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
status.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
status.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
const statusForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
statusForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::status
* @see app/Http/Controllers/MeshTaskController.php:113
* @route '/api/mesh/task/{id}/status'
*/
statusForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status.form = statusForm

const task = {
    dispatch: Object.assign(dispatch, dispatch),
    callback: Object.assign(callback, callback),
    status: Object.assign(status, status),
}

export default task