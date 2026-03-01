import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
export const nodes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nodes.url(options),
    method: 'get',
})

nodes.definition = {
    methods: ["get","head"],
    url: '/api/mesh/nodes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
nodes.url = (options?: RouteQueryOptions) => {
    return nodes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
nodes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
nodes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: nodes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
const nodesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
nodesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:17
* @route '/api/mesh/nodes'
*/
nodesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: nodes.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

nodes.form = nodesForm

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sync.url(options),
    method: 'get',
})

sync.definition = {
    methods: ["get","head"],
    url: '/api/mesh/sync',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
sync.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sync.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
sync.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sync.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sync.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
syncForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sync.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::sync
* @see app/Http/Controllers/MeshController.php:26
* @route '/api/mesh/sync'
*/
syncForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sync.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\MeshController::heartbeat
* @see app/Http/Controllers/MeshController.php:41
* @route '/api/mesh/heartbeat'
*/
export const heartbeat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

heartbeat.definition = {
    methods: ["post"],
    url: '/api/mesh/heartbeat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MeshController::heartbeat
* @see app/Http/Controllers/MeshController.php:41
* @route '/api/mesh/heartbeat'
*/
heartbeat.url = (options?: RouteQueryOptions) => {
    return heartbeat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshController::heartbeat
* @see app/Http/Controllers/MeshController.php:41
* @route '/api/mesh/heartbeat'
*/
heartbeat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshController::heartbeat
* @see app/Http/Controllers/MeshController.php:41
* @route '/api/mesh/heartbeat'
*/
const heartbeatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshController::heartbeat
* @see app/Http/Controllers/MeshController.php:41
* @route '/api/mesh/heartbeat'
*/
heartbeatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

heartbeat.form = heartbeatForm

const MeshController = { nodes, sync, heartbeat }

export default MeshController