import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Chat\ChatChannelController::index
* @see app/Http/Controllers/Chat/ChatChannelController.php:18
* @route '/text-chat'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/text-chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::index
* @see app/Http/Controllers/Chat/ChatChannelController.php:18
* @route '/text-chat'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::index
* @see app/Http/Controllers/Chat/ChatChannelController.php:18
* @route '/text-chat'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::index
* @see app/Http/Controllers/Chat/ChatChannelController.php:18
* @route '/text-chat'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:81
* @route '/text-chat/channels'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/text-chat/channels',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:81
* @route '/text-chat/channels'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:81
* @route '/text-chat/channels'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::show
* @see app/Http/Controllers/Chat/ChatChannelController.php:36
* @route '/text-chat/{channel}'
*/
export const show = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/text-chat/{channel}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::show
* @see app/Http/Controllers/Chat/ChatChannelController.php:36
* @route '/text-chat/{channel}'
*/
show.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::show
* @see app/Http/Controllers/Chat/ChatChannelController.php:36
* @route '/text-chat/{channel}'
*/
show.get = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::show
* @see app/Http/Controllers/Chat/ChatChannelController.php:36
* @route '/text-chat/{channel}'
*/
show.head = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::join
* @see app/Http/Controllers/Chat/ChatChannelController.php:115
* @route '/text-chat/{channel}/join'
*/
export const join = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/text-chat/{channel}/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::join
* @see app/Http/Controllers/Chat/ChatChannelController.php:115
* @route '/text-chat/{channel}/join'
*/
join.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return join.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::join
* @see app/Http/Controllers/Chat/ChatChannelController.php:115
* @route '/text-chat/{channel}/join'
*/
join.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::leave
* @see app/Http/Controllers/Chat/ChatChannelController.php:127
* @route '/text-chat/{channel}/leave'
*/
export const leave = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

leave.definition = {
    methods: ["post"],
    url: '/text-chat/{channel}/leave',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::leave
* @see app/Http/Controllers/Chat/ChatChannelController.php:127
* @route '/text-chat/{channel}/leave'
*/
leave.url = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return leave.definition.url
            .replace('{channel}', parsedArgs.channel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::leave
* @see app/Http/Controllers/Chat/ChatChannelController.php:127
* @route '/text-chat/{channel}/leave'
*/
leave.post = (args: { channel: string | { slug: string } } | [channel: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

const ChatChannelController = { index, store, show, join, leave }

export default ChatChannelController