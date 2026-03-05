import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
export const push = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

push.definition = {
    methods: ["post"],
    url: '/api/system-events/push',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
push.url = (options?: RouteQueryOptions) => {
    return push.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
push.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

const systemEvents = {
    push: Object.assign(push, push),
}

export default systemEvents