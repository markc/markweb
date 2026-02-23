import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
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
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
* @route '/chat'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
* @route '/chat'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
* @route '/chat'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
* @route '/chat'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
* @route '/chat'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::index
* @see app/Http/Controllers/ChatController.php:27
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
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
export const projects = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: projects.url(options),
    method: 'get',
})

projects.definition = {
    methods: ["get","head"],
    url: '/chat/projects',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
projects.url = (options?: RouteQueryOptions) => {
    return projects.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
projects.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: projects.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
projects.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: projects.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
const projectsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: projects.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
projectsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: projects.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::projects
* @see app/Http/Controllers/ChatController.php:43
* @route '/chat/projects'
*/
projectsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: projects.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

projects.form = projectsForm

/**
* @see \App\Http\Controllers\ChatController::stream
* @see app/Http/Controllers/ChatController.php:80
* @route '/chat/stream'
*/
export const stream = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/chat/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::stream
* @see app/Http/Controllers/ChatController.php:80
* @route '/chat/stream'
*/
stream.url = (options?: RouteQueryOptions) => {
    return stream.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::stream
* @see app/Http/Controllers/ChatController.php:80
* @route '/chat/stream'
*/
stream.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::stream
* @see app/Http/Controllers/ChatController.php:80
* @route '/chat/stream'
*/
const streamForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::stream
* @see app/Http/Controllers/ChatController.php:80
* @route '/chat/stream'
*/
streamForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(options),
    method: 'post',
})

stream.form = streamForm

/**
* @see \App\Http\Controllers\ChatController::upload
* @see app/Http/Controllers/ChatController.php:328
* @route '/chat/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/chat/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::upload
* @see app/Http/Controllers/ChatController.php:328
* @route '/chat/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::upload
* @see app/Http/Controllers/ChatController.php:328
* @route '/chat/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::upload
* @see app/Http/Controllers/ChatController.php:328
* @route '/chat/upload'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::upload
* @see app/Http/Controllers/ChatController.php:328
* @route '/chat/upload'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
export const attachment = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attachment.url(args, options),
    method: 'get',
})

attachment.definition = {
    methods: ["get","head"],
    url: '/chat/attachment/{attachment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
attachment.url = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attachment: args }
    }

    if (Array.isArray(args)) {
        args = {
            attachment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        attachment: args.attachment,
    }

    return attachment.definition.url
            .replace('{attachment}', parsedArgs.attachment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
attachment.get = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attachment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
attachment.head = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attachment.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
const attachmentForm = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attachment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
attachmentForm.get = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attachment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::attachment
* @see app/Http/Controllers/ChatController.php:355
* @route '/chat/attachment/{attachment}'
*/
attachmentForm.head = (args: { attachment: string | number } | [attachment: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attachment.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

attachment.form = attachmentForm

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
export const openclawLastUser = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openclawLastUser.url(options),
    method: 'get',
})

openclawLastUser.definition = {
    methods: ["get","head"],
    url: '/chat/openclaw-last-user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
openclawLastUser.url = (options?: RouteQueryOptions) => {
    return openclawLastUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
openclawLastUser.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openclawLastUser.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
openclawLastUser.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openclawLastUser.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
const openclawLastUserForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openclawLastUser.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
openclawLastUserForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openclawLastUser.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::openclawLastUser
* @see app/Http/Controllers/ChatController.php:415
* @route '/chat/openclaw-last-user'
*/
openclawLastUserForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openclawLastUser.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

openclawLastUser.form = openclawLastUserForm

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
export const lastMessage = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lastMessage.url(args, options),
    method: 'get',
})

lastMessage.definition = {
    methods: ["get","head"],
    url: '/chat/{conversation}/last-message',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
lastMessage.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return lastMessage.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
lastMessage.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lastMessage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
lastMessage.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lastMessage.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
const lastMessageForm = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: lastMessage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
lastMessageForm.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: lastMessage.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::lastMessage
* @see app/Http/Controllers/ChatController.php:366
* @route '/chat/{conversation}/last-message'
*/
lastMessageForm.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: lastMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

lastMessage.form = lastMessageForm

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
export const show = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/chat/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
show.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return show.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
show.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
show.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
const showForm = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
showForm.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::show
* @see app/Http/Controllers/ChatController.php:57
* @route '/chat/{conversation}'
*/
showForm.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
export const exportMethod = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/chat/{conversation}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
exportMethod.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return exportMethod.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
exportMethod.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
exportMethod.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
const exportMethodForm = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
exportMethodForm.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
* @see app/Http/Controllers/ChatController.php:305
* @route '/chat/{conversation}/export'
*/
exportMethodForm.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ChatController::appendMessage
* @see app/Http/Controllers/ChatController.php:390
* @route '/chat/{conversation}/message'
*/
export const appendMessage = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: appendMessage.url(args, options),
    method: 'post',
})

appendMessage.definition = {
    methods: ["post"],
    url: '/chat/{conversation}/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::appendMessage
* @see app/Http/Controllers/ChatController.php:390
* @route '/chat/{conversation}/message'
*/
appendMessage.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return appendMessage.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::appendMessage
* @see app/Http/Controllers/ChatController.php:390
* @route '/chat/{conversation}/message'
*/
appendMessage.post = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: appendMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::appendMessage
* @see app/Http/Controllers/ChatController.php:390
* @route '/chat/{conversation}/message'
*/
const appendMessageForm = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: appendMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::appendMessage
* @see app/Http/Controllers/ChatController.php:390
* @route '/chat/{conversation}/message'
*/
appendMessageForm.post = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: appendMessage.url(args, options),
    method: 'post',
})

appendMessage.form = appendMessageForm

/**
* @see \App\Http\Controllers\ChatController::destroy
* @see app/Http/Controllers/ChatController.php:378
* @route '/chat/{conversation}'
*/
export const destroy = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/chat/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::destroy
* @see app/Http/Controllers/ChatController.php:378
* @route '/chat/{conversation}'
*/
destroy.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: args.conversation,
    }

    return destroy.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::destroy
* @see app/Http/Controllers/ChatController.php:378
* @route '/chat/{conversation}'
*/
destroy.delete = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::destroy
* @see app/Http/Controllers/ChatController.php:378
* @route '/chat/{conversation}'
*/
const destroyForm = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::destroy
* @see app/Http/Controllers/ChatController.php:378
* @route '/chat/{conversation}'
*/
destroyForm.delete = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ChatController = { index, projects, stream, upload, attachment, openclawLastUser, lastMessage, show, exportMethod, appendMessage, destroy, export: exportMethod }

export default ChatController