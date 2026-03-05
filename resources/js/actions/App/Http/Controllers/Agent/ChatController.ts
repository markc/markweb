import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::index
* @see app/Http/Controllers/Agent/ChatController.php:28
* @route '/chat'
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
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
export const show = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/chat/{agentSession}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
show.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentSession: typeof args.agentSession === 'object'
        ? args.agentSession.id
        : args.agentSession,
    }

    return show.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
show.get = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
show.head = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
const showForm = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
showForm.get = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::show
* @see app/Http/Controllers/Agent/ChatController.php:39
* @route '/chat/{agentSession}'
*/
showForm.head = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Agent\ChatController::send
* @see app/Http/Controllers/Agent/ChatController.php:54
* @route '/chat/send'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/chat/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::send
* @see app/Http/Controllers/Agent/ChatController.php:54
* @route '/chat/send'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::send
* @see app/Http/Controllers/Agent/ChatController.php:54
* @route '/chat/send'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::send
* @see app/Http/Controllers/Agent/ChatController.php:54
* @route '/chat/send'
*/
const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::send
* @see app/Http/Controllers/Agent/ChatController.php:54
* @route '/chat/send'
*/
sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

send.form = sendForm

/**
* @see \App\Http\Controllers\Agent\ChatController::destroy
* @see app/Http/Controllers/Agent/ChatController.php:97
* @route '/chat/{agentSession}'
*/
export const destroy = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/chat/{agentSession}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::destroy
* @see app/Http/Controllers/Agent/ChatController.php:97
* @route '/chat/{agentSession}'
*/
destroy.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentSession: typeof args.agentSession === 'object'
        ? args.agentSession.id
        : args.agentSession,
    }

    return destroy.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::destroy
* @see app/Http/Controllers/Agent/ChatController.php:97
* @route '/chat/{agentSession}'
*/
destroy.delete = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::destroy
* @see app/Http/Controllers/Agent/ChatController.php:97
* @route '/chat/{agentSession}'
*/
const destroyForm = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::destroy
* @see app/Http/Controllers/Agent/ChatController.php:97
* @route '/chat/{agentSession}'
*/
destroyForm.delete = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Agent\ChatController::update
* @see app/Http/Controllers/Agent/ChatController.php:277
* @route '/chat/{agentSession}'
*/
export const update = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/chat/{agentSession}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::update
* @see app/Http/Controllers/Agent/ChatController.php:277
* @route '/chat/{agentSession}'
*/
update.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentSession: typeof args.agentSession === 'object'
        ? args.agentSession.id
        : args.agentSession,
    }

    return update.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::update
* @see app/Http/Controllers/Agent/ChatController.php:277
* @route '/chat/{agentSession}'
*/
update.patch = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::update
* @see app/Http/Controllers/Agent/ChatController.php:277
* @route '/chat/{agentSession}'
*/
const updateForm = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::update
* @see app/Http/Controllers/Agent/ChatController.php:277
* @route '/chat/{agentSession}'
*/
updateForm.patch = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Agent\ChatController::uploadDocument
* @see app/Http/Controllers/Agent/ChatController.php:114
* @route '/chat/documents'
*/
export const uploadDocument = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadDocument.url(options),
    method: 'post',
})

uploadDocument.definition = {
    methods: ["post"],
    url: '/chat/documents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::uploadDocument
* @see app/Http/Controllers/Agent/ChatController.php:114
* @route '/chat/documents'
*/
uploadDocument.url = (options?: RouteQueryOptions) => {
    return uploadDocument.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::uploadDocument
* @see app/Http/Controllers/Agent/ChatController.php:114
* @route '/chat/documents'
*/
uploadDocument.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadDocument.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::uploadDocument
* @see app/Http/Controllers/Agent/ChatController.php:114
* @route '/chat/documents'
*/
const uploadDocumentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadDocument.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::uploadDocument
* @see app/Http/Controllers/Agent/ChatController.php:114
* @route '/chat/documents'
*/
uploadDocumentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadDocument.url(options),
    method: 'post',
})

uploadDocument.form = uploadDocumentForm

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
export const documents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})

documents.definition = {
    methods: ["get","head"],
    url: '/chat/documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
documents.url = (options?: RouteQueryOptions) => {
    return documents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
documents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
documents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: documents.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
const documentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
documentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::documents
* @see app/Http/Controllers/Agent/ChatController.php:153
* @route '/chat/documents'
*/
documentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documents.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

documents.form = documentsForm

/**
* @see \App\Http\Controllers\Agent\ChatController::deleteDocument
* @see app/Http/Controllers/Agent/ChatController.php:169
* @route '/chat/documents/{filename}'
*/
export const deleteDocument = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDocument.url(args, options),
    method: 'delete',
})

deleteDocument.definition = {
    methods: ["delete"],
    url: '/chat/documents/{filename}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::deleteDocument
* @see app/Http/Controllers/Agent/ChatController.php:169
* @route '/chat/documents/{filename}'
*/
deleteDocument.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        filename: args.filename,
    }

    return deleteDocument.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::deleteDocument
* @see app/Http/Controllers/Agent/ChatController.php:169
* @route '/chat/documents/{filename}'
*/
deleteDocument.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDocument.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::deleteDocument
* @see app/Http/Controllers/Agent/ChatController.php:169
* @route '/chat/documents/{filename}'
*/
const deleteDocumentForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteDocument.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::deleteDocument
* @see app/Http/Controllers/Agent/ChatController.php:169
* @route '/chat/documents/{filename}'
*/
deleteDocumentForm.delete = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteDocument.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteDocument.form = deleteDocumentForm

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
export const exportMethod = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/chat/{agentSession}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
exportMethod.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentSession: typeof args.agentSession === 'object'
        ? args.agentSession.id
        : args.agentSession,
    }

    return exportMethod.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
exportMethod.get = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
exportMethod.head = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
const exportMethodForm = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
exportMethodForm.get = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::exportMethod
* @see app/Http/Controllers/Agent/ChatController.php:181
* @route '/chat/{agentSession}/export'
*/
exportMethodForm.head = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \App\Http\Controllers\Agent\ChatController::fork
* @see app/Http/Controllers/Agent/ChatController.php:225
* @route '/chat/{agentSession}/fork'
*/
export const fork = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fork.url(args, options),
    method: 'post',
})

fork.definition = {
    methods: ["post"],
    url: '/chat/{agentSession}/fork',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Agent\ChatController::fork
* @see app/Http/Controllers/Agent/ChatController.php:225
* @route '/chat/{agentSession}/fork'
*/
fork.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentSession: typeof args.agentSession === 'object'
        ? args.agentSession.id
        : args.agentSession,
    }

    return fork.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\ChatController::fork
* @see app/Http/Controllers/Agent/ChatController.php:225
* @route '/chat/{agentSession}/fork'
*/
fork.post = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fork.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::fork
* @see app/Http/Controllers/Agent/ChatController.php:225
* @route '/chat/{agentSession}/fork'
*/
const forkForm = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fork.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Agent\ChatController::fork
* @see app/Http/Controllers/Agent/ChatController.php:225
* @route '/chat/{agentSession}/fork'
*/
forkForm.post = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fork.url(args, options),
    method: 'post',
})

fork.form = forkForm

const ChatController = { index, show, send, destroy, update, uploadDocument, documents, deleteDocument, exportMethod, fork, export: exportMethod }

export default ChatController