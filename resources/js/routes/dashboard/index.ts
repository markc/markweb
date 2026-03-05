import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::settings
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/settings'
*/
export const settings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settings.url(options),
    method: 'post',
})

settings.definition = {
    methods: ["post"],
    url: '/dashboard/settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::settings
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/settings'
*/
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::settings
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/settings'
*/
settings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: settings.url(options),
    method: 'post',
})

const dashboard = {
    settings: Object.assign(settings, settings),
}

export default dashboard