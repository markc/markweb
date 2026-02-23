import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FileLinkController::upload
* @see app/Http/Controllers/FileLinkController.php:12
* @route '/api/filelink/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/api/filelink/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FileLinkController::upload
* @see app/Http/Controllers/FileLinkController.php:12
* @route '/api/filelink/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileLinkController::upload
* @see app/Http/Controllers/FileLinkController.php:12
* @route '/api/filelink/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FileLinkController::upload
* @see app/Http/Controllers/FileLinkController.php:12
* @route '/api/filelink/upload'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FileLinkController::upload
* @see app/Http/Controllers/FileLinkController.php:12
* @route '/api/filelink/upload'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
* @see \App\Http\Controllers\FileLinkController::destroy
* @see app/Http/Controllers/FileLinkController.php:46
* @route '/api/filelink/{sharedFile}'
*/
export const destroy = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/filelink/{sharedFile}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FileLinkController::destroy
* @see app/Http/Controllers/FileLinkController.php:46
* @route '/api/filelink/{sharedFile}'
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
* @see \App\Http\Controllers\FileLinkController::destroy
* @see app/Http/Controllers/FileLinkController.php:46
* @route '/api/filelink/{sharedFile}'
*/
destroy.delete = (args: { sharedFile: number | { id: number } } | [sharedFile: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\FileLinkController::destroy
* @see app/Http/Controllers/FileLinkController.php:46
* @route '/api/filelink/{sharedFile}'
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
* @see \App\Http\Controllers\FileLinkController::destroy
* @see app/Http/Controllers/FileLinkController.php:46
* @route '/api/filelink/{sharedFile}'
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

const FileLinkController = { upload, destroy }

export default FileLinkController