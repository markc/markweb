import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/shared-files',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SharedFileController::index
* @see app/Http/Controllers/SharedFileController.php:12
* @route '/shared-files'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\SharedFileController::destroy
* @see app/Http/Controllers/SharedFileController.php:29
* @route '/shared-files/{sharedFile}'
*/
export const destroy = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/shared-files/{sharedFile}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SharedFileController::destroy
* @see app/Http/Controllers/SharedFileController.php:29
* @route '/shared-files/{sharedFile}'
*/
destroy.url = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sharedFile: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sharedFile: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sharedFile: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sharedFile: typeof args.sharedFile === 'object'
        ? args.sharedFile.id
        : args.sharedFile,
    }

    return destroy.definition.url
            .replace('{sharedFile}', parsedArgs.sharedFile.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SharedFileController::destroy
* @see app/Http/Controllers/SharedFileController.php:29
* @route '/shared-files/{sharedFile}'
*/
destroy.delete = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SharedFileController::destroy
* @see app/Http/Controllers/SharedFileController.php:29
* @route '/shared-files/{sharedFile}'
*/
const destroyForm = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SharedFileController::destroy
* @see app/Http/Controllers/SharedFileController.php:29
* @route '/shared-files/{sharedFile}'
*/
destroyForm.delete = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const SharedFileController = { index, destroy }

export default SharedFileController