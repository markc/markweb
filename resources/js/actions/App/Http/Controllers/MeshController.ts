import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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

const MeshController = { nodes }

export default MeshController