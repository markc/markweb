import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AppMeshController::services
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
export const services = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: services.url(options),
    method: 'get',
})

services.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/dbus/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::services
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
services.url = (options?: RouteQueryOptions) => {
    return services.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::services
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
services.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: services.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::services
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
services.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: services.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::introspect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
export const introspect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: introspect.url(options),
    method: 'post',
})

introspect.definition = {
    methods: ["post"],
    url: '/api/appmesh/dbus/introspect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::introspect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
introspect.url = (options?: RouteQueryOptions) => {
    return introspect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::introspect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
introspect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: introspect.url(options),
    method: 'post',
})

const dbus = {
    services: Object.assign(services, services),
    introspect: Object.assign(introspect, introspect),
}

export default dbus