import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OpenClawPushController::push
* @see app/Http/Controllers/OpenClawPushController.php:11
* @route '/api/openclaw/push'
*/
export const push = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

push.definition = {
    methods: ["post"],
    url: '/api/openclaw/push',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OpenClawPushController::push
* @see app/Http/Controllers/OpenClawPushController.php:11
* @route '/api/openclaw/push'
*/
push.url = (options?: RouteQueryOptions) => {
    return push.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpenClawPushController::push
* @see app/Http/Controllers/OpenClawPushController.php:11
* @route '/api/openclaw/push'
*/
push.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OpenClawPushController::push
* @see app/Http/Controllers/OpenClawPushController.php:11
* @route '/api/openclaw/push'
*/
const pushForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OpenClawPushController::push
* @see app/Http/Controllers/OpenClawPushController.php:11
* @route '/api/openclaw/push'
*/
pushForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

push.form = pushForm

const OpenClawPushController = { push }

export default OpenClawPushController