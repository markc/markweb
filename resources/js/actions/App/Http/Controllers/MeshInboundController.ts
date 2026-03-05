import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MeshInboundController::receive
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
export const receive = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(options),
    method: 'post',
})

receive.definition = {
    methods: ["post"],
    url: '/api/mesh/inbound',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MeshInboundController::receive
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
receive.url = (options?: RouteQueryOptions) => {
    return receive.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeshInboundController::receive
* @see app/Http/Controllers/MeshInboundController.php:32
* @route '/api/mesh/inbound'
*/
receive.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receive.url(options),
    method: 'post',
})

const MeshInboundController = { receive }

export default MeshInboundController