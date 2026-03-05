import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import task from './task'
/**
* @see \App\Http\Controllers\MeshInboundController::inbound
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
export const inbound = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

inbound.definition = {
    methods: ["post"],
    url: '/api/mesh/inbound',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MeshInboundController::inbound
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
inbound.url = (options?: RouteQueryOptions) => {
    return inbound.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshInboundController::inbound
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
inbound.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshInboundController::inbound
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
const inboundForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: inbound.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MeshInboundController::inbound
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
inboundForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: inbound.url(options),
    method: 'post',
})

inbound.form = inboundForm

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
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
* @see app/Http/Controllers/MeshController.php:15
* @route '/api/mesh/nodes'
*/
nodes.url = (options?: RouteQueryOptions) => {
    return nodes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
* @route '/api/mesh/nodes'
*/
nodes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
* @route '/api/mesh/nodes'
*/
nodes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: nodes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
* @route '/api/mesh/nodes'
*/
const nodesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
* @route '/api/mesh/nodes'
*/
nodesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: nodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshController::nodes
* @see app/Http/Controllers/MeshController.php:15
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
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
export const tasks = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tasks.url(options),
    method: 'get',
})

tasks.definition = {
    methods: ["get","head"],
    url: '/api/mesh/tasks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
tasks.url = (options?: RouteQueryOptions) => {
    return tasks.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
tasks.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tasks.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
tasks.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tasks.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
const tasksForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tasks.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
tasksForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tasks.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MeshTaskController::tasks
* @see app/Http/Controllers/MeshTaskController.php:125
* @route '/api/mesh/tasks'
*/
tasksForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tasks.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

tasks.form = tasksForm

const mesh = {
    inbound: Object.assign(inbound, inbound),
    nodes: Object.assign(nodes, nodes),
    task: Object.assign(task, task),
    tasks: Object.assign(tasks, tasks),
}

export default mesh