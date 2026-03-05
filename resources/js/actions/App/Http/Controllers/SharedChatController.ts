import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SharedChatController::share
* @see app/Http/Controllers/SharedChatController.php:16
* @route '/chat/{agentSession}/share'
*/
export const share = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: share.url(args, options),
    method: 'post',
})

share.definition = {
    methods: ["post"],
    url: '/chat/{agentSession}/share',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SharedChatController::share
* @see app/Http/Controllers/SharedChatController.php:16
* @route '/chat/{agentSession}/share'
*/
share.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return share.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SharedChatController::share
* @see app/Http/Controllers/SharedChatController.php:16
* @route '/chat/{agentSession}/share'
*/
share.post = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: share.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SharedChatController::unshare
* @see app/Http/Controllers/SharedChatController.php:33
* @route '/chat/{agentSession}/share'
*/
export const unshare = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unshare.url(args, options),
    method: 'delete',
})

unshare.definition = {
    methods: ["delete"],
    url: '/chat/{agentSession}/share',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SharedChatController::unshare
* @see app/Http/Controllers/SharedChatController.php:33
* @route '/chat/{agentSession}/share'
*/
unshare.url = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return unshare.definition.url
            .replace('{agentSession}', parsedArgs.agentSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SharedChatController::unshare
* @see app/Http/Controllers/SharedChatController.php:33
* @route '/chat/{agentSession}/share'
*/
unshare.delete = (args: { agentSession: number | { id: number } } | [agentSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unshare.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SharedChatController::show
* @see app/Http/Controllers/SharedChatController.php:45
* @route '/s/{token}'
*/
export const show = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/s/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SharedChatController::show
* @see app/Http/Controllers/SharedChatController.php:45
* @route '/s/{token}'
*/
show.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return show.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SharedChatController::show
* @see app/Http/Controllers/SharedChatController.php:45
* @route '/s/{token}'
*/
show.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SharedChatController::show
* @see app/Http/Controllers/SharedChatController.php:45
* @route '/s/{token}'
*/
show.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const SharedChatController = { share, unshare, show }

export default SharedChatController