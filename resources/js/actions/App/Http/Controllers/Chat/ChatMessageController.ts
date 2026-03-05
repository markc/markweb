import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
export const index = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/text-chat/{channel}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
index.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { channel: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { channel: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            channel: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        channel: typeof args.channel === 'object'
        ? args.channel.slug
        : args.channel,
    }

    return index.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
index.get = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
index.head = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
const indexForm = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
indexForm.get = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::index
* @see app/Http/Controllers/Chat/ChatMessageController.php:21
* @route '/text-chat/{channel}/messages'
*/
indexForm.head = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::store
* @see app/Http/Controllers/Chat/ChatMessageController.php:60
* @route '/text-chat/{channel}/messages'
*/
export const store = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/text-chat/{channel}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::store
* @see app/Http/Controllers/Chat/ChatMessageController.php:60
* @route '/text-chat/{channel}/messages'
*/
store.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { channel: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { channel: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            channel: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        channel: typeof args.channel === 'object'
        ? args.channel.slug
        : args.channel,
    }

    return store.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::store
* @see app/Http/Controllers/Chat/ChatMessageController.php:60
* @route '/text-chat/{channel}/messages'
*/
store.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::store
* @see app/Http/Controllers/Chat/ChatMessageController.php:60
* @route '/text-chat/{channel}/messages'
*/
const storeForm = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::store
* @see app/Http/Controllers/Chat/ChatMessageController.php:60
* @route '/text-chat/{channel}/messages'
*/
storeForm.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::update
* @see app/Http/Controllers/Chat/ChatMessageController.php:102
* @route '/text-chat/messages/{message}'
*/
export const update = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/text-chat/messages/{message}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::update
* @see app/Http/Controllers/Chat/ChatMessageController.php:102
* @route '/text-chat/messages/{message}'
*/
update.url = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { message: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            message: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return update.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::update
* @see app/Http/Controllers/Chat/ChatMessageController.php:102
* @route '/text-chat/messages/{message}'
*/
update.patch = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::update
* @see app/Http/Controllers/Chat/ChatMessageController.php:102
* @route '/text-chat/messages/{message}'
*/
const updateForm = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::update
* @see app/Http/Controllers/Chat/ChatMessageController.php:102
* @route '/text-chat/messages/{message}'
*/
updateForm.patch = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Chat\ChatMessageController::destroy
* @see app/Http/Controllers/Chat/ChatMessageController.php:119
* @route '/text-chat/messages/{message}'
*/
export const destroy = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/text-chat/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::destroy
* @see app/Http/Controllers/Chat/ChatMessageController.php:119
* @route '/text-chat/messages/{message}'
*/
destroy.url = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { message: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            message: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return destroy.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::destroy
* @see app/Http/Controllers/Chat/ChatMessageController.php:119
* @route '/text-chat/messages/{message}'
*/
destroy.delete = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::destroy
* @see app/Http/Controllers/Chat/ChatMessageController.php:119
* @route '/text-chat/messages/{message}'
*/
const destroyForm = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::destroy
* @see app/Http/Controllers/Chat/ChatMessageController.php:119
* @route '/text-chat/messages/{message}'
*/
destroyForm.delete = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Chat\ChatMessageController::react
* @see app/Http/Controllers/Chat/ChatMessageController.php:130
* @route '/text-chat/messages/{message}/react'
*/
export const react = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: react.url(args, options),
    method: 'post',
})

react.definition = {
    methods: ["post"],
    url: '/text-chat/messages/{message}/react',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::react
* @see app/Http/Controllers/Chat/ChatMessageController.php:130
* @route '/text-chat/messages/{message}/react'
*/
react.url = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { message: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            message: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return react.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::react
* @see app/Http/Controllers/Chat/ChatMessageController.php:130
* @route '/text-chat/messages/{message}/react'
*/
react.post = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: react.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::react
* @see app/Http/Controllers/Chat/ChatMessageController.php:130
* @route '/text-chat/messages/{message}/react'
*/
const reactForm = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: react.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::react
* @see app/Http/Controllers/Chat/ChatMessageController.php:130
* @route '/text-chat/messages/{message}/react'
*/
reactForm.post = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: react.url(args, options),
    method: 'post',
})

react.form = reactForm

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::unreact
* @see app/Http/Controllers/Chat/ChatMessageController.php:146
* @route '/text-chat/messages/{message}/react'
*/
export const unreact = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unreact.url(args, options),
    method: 'delete',
})

unreact.definition = {
    methods: ["delete"],
    url: '/text-chat/messages/{message}/react',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::unreact
* @see app/Http/Controllers/Chat/ChatMessageController.php:146
* @route '/text-chat/messages/{message}/react'
*/
unreact.url = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { message: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            message: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return unreact.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::unreact
* @see app/Http/Controllers/Chat/ChatMessageController.php:146
* @route '/text-chat/messages/{message}/react'
*/
unreact.delete = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unreact.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::unreact
* @see app/Http/Controllers/Chat/ChatMessageController.php:146
* @route '/text-chat/messages/{message}/react'
*/
const unreactForm = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unreact.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::unreact
* @see app/Http/Controllers/Chat/ChatMessageController.php:146
* @route '/text-chat/messages/{message}/react'
*/
unreactForm.delete = (args: { message: number | { id: number } } | [message: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unreact.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

unreact.form = unreactForm

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::typing
* @see app/Http/Controllers/Chat/ChatMessageController.php:162
* @route '/text-chat/{channel}/typing'
*/
export const typing = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: typing.url(args, options),
    method: 'post',
})

typing.definition = {
    methods: ["post"],
    url: '/text-chat/{channel}/typing',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::typing
* @see app/Http/Controllers/Chat/ChatMessageController.php:162
* @route '/text-chat/{channel}/typing'
*/
typing.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { channel: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { channel: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            channel: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        channel: typeof args.channel === 'object'
        ? args.channel.slug
        : args.channel,
    }

    return typing.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::typing
* @see app/Http/Controllers/Chat/ChatMessageController.php:162
* @route '/text-chat/{channel}/typing'
*/
typing.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: typing.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::typing
* @see app/Http/Controllers/Chat/ChatMessageController.php:162
* @route '/text-chat/{channel}/typing'
*/
const typingForm = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: typing.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatMessageController::typing
* @see app/Http/Controllers/Chat/ChatMessageController.php:162
* @route '/text-chat/{channel}/typing'
*/
typingForm.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: typing.url(args, options),
    method: 'post',
})

typing.form = typingForm

const ChatMessageController = { index, store, update, destroy, react, unreact, typing }

export default ChatMessageController