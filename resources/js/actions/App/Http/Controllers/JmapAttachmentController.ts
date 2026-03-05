import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
export const download = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/api/jmap/blob/{blobId}/{name}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
download.url = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            blobId: args[0],
            name: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        blobId: args.blobId,
        name: args.name,
    }

    return download.definition.url
            .replace('{blobId}', parsedArgs.blobId.toString())
            .replace('{name}', parsedArgs.name.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
download.get = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
download.head = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
const downloadForm = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
downloadForm.get = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::download
* @see app/Http/Controllers/JmapAttachmentController.php:17
* @route '/api/jmap/blob/{blobId}/{name}'
*/
downloadForm.head = (args: { blobId: string | number, name: string | number } | [blobId: string | number, name: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

/**
* @see \App\Http\Controllers\JmapAttachmentController::upload
* @see app/Http/Controllers/JmapAttachmentController.php:48
* @route '/api/jmap/blob/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/api/jmap/blob/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\JmapAttachmentController::upload
* @see app/Http/Controllers/JmapAttachmentController.php:48
* @route '/api/jmap/blob/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\JmapAttachmentController::upload
* @see app/Http/Controllers/JmapAttachmentController.php:48
* @route '/api/jmap/blob/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::upload
* @see app/Http/Controllers/JmapAttachmentController.php:48
* @route '/api/jmap/blob/upload'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\JmapAttachmentController::upload
* @see app/Http/Controllers/JmapAttachmentController.php:48
* @route '/api/jmap/blob/upload'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

const JmapAttachmentController = { download, upload }

export default JmapAttachmentController