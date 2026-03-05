import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

/**
* @see routes/web.php:7
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:7
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see routes/web.php:7
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:7
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
export const dav = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dav.url(args, options),
    method: 'get',
})

dav.definition = {
    methods: ["get","head","post","put","patch","delete","options","propfind","proppatch","mkcol","copy","move","lock","unlock","report","mkcalendar"],
    url: '/dav/{path?}',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","propfind","proppatch","mkcol","copy","move","lock","unlock","report","mkcalendar"]>

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.url = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    if (Array.isArray(args)) {
        args = {
            path: args[0],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "path",
    ])

    const parsedArgs = {
        path: args?.path,
    }

    return dav.definition.url
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.get = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dav.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.head = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dav.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.post = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dav.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.put = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: dav.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.patch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: dav.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.delete = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: dav.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.options = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: dav.url(args, options),
    method: 'options',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.propfind = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'propfind'> => ({
    url: dav.url(args, options),
    method: 'propfind',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.proppatch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'proppatch'> => ({
    url: dav.url(args, options),
    method: 'proppatch',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.mkcol = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'mkcol'> => ({
    url: dav.url(args, options),
    method: 'mkcol',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.copy = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'copy'> => ({
    url: dav.url(args, options),
    method: 'copy',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.move = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'move'> => ({
    url: dav.url(args, options),
    method: 'move',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.lock = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'lock'> => ({
    url: dav.url(args, options),
    method: 'lock',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.unlock = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'unlock'> => ({
    url: dav.url(args, options),
    method: 'unlock',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.report = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'report'> => ({
    url: dav.url(args, options),
    method: 'report',
})

/**
* @see \App\Http\Controllers\DavController::dav
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
dav.mkcalendar = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'mkcalendar'> => ({
    url: dav.url(args, options),
    method: 'mkcalendar',
})

