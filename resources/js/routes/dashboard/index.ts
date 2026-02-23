import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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

/**
* @see \App\Http\Controllers\DashboardController::settings
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/settings'
*/
const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: settings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::settings
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/settings'
*/
settingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: settings.url(options),
    method: 'post',
})

settings.form = settingsForm

const dashboard = {
    settings: Object.assign(settings, settings),
}

export default dashboard