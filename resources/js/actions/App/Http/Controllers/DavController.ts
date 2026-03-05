import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
export const handle = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handle.url(args, options),
    method: 'get',
})

handle.definition = {
    methods: ["get","head","post","put","patch","delete","options","propfind","proppatch","mkcol","copy","move","lock","unlock","report","mkcalendar"],
    url: '/dav/{path?}',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options","propfind","proppatch","mkcol","copy","move","lock","unlock","report","mkcalendar"]>

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.url = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return handle.definition.url
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.get = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handle.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.head = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: handle.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.post = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.put = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: handle.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.patch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: handle.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.delete = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: handle.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.options = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: handle.url(args, options),
    method: 'options',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.propfind = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'propfind'> => ({
    url: handle.url(args, options),
    method: 'propfind',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.proppatch = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'proppatch'> => ({
    url: handle.url(args, options),
    method: 'proppatch',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.mkcol = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'mkcol'> => ({
    url: handle.url(args, options),
    method: 'mkcol',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.copy = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'copy'> => ({
    url: handle.url(args, options),
    method: 'copy',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.move = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'move'> => ({
    url: handle.url(args, options),
    method: 'move',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.lock = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'lock'> => ({
    url: handle.url(args, options),
    method: 'lock',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.unlock = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'unlock'> => ({
    url: handle.url(args, options),
    method: 'unlock',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.report = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'report'> => ({
    url: handle.url(args, options),
    method: 'report',
})

/**
* @see \App\Http\Controllers\DavController::handle
* @see app/Http/Controllers/DavController.php:11
* @route '/dav/{path?}'
*/
handle.mkcalendar = (args?: { path?: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'mkcalendar'> => ({
    url: handle.url(args, options),
    method: 'mkcalendar',
})

const DavController = { handle }

export default DavController