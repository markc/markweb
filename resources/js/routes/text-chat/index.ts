import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import channels from './channels'
import messages from './messages'
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

const textChat = {
    index: Object.assign(index, index),
    channels: Object.assign(channels, channels),
    show: Object.assign(show, show),
    join: Object.assign(join, join),
    leave: Object.assign(leave, leave),
    messages: Object.assign(messages, messages),
    typing: Object.assign(typing, typing),
}

export default textChat