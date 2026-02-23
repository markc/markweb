import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/system-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SystemEventController::index
* @see app/Http/Controllers/SystemEventController.php:17
* @route '/api/system-events'
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
* @see \App\Http\Controllers\SystemEventController::store
* @see app/Http/Controllers/SystemEventController.php:31
* @route '/api/system-events'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/system-events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::store
* @see app/Http/Controllers/SystemEventController.php:31
* @route '/api/system-events'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::store
* @see app/Http/Controllers/SystemEventController.php:31
* @route '/api/system-events'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::store
* @see app/Http/Controllers/SystemEventController.php:31
* @route '/api/system-events'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::store
* @see app/Http/Controllers/SystemEventController.php:31
* @route '/api/system-events'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SystemEventController::markAllRead
* @see app/Http/Controllers/SystemEventController.php:66
* @route '/api/system-events/read-all'
*/
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/api/system-events/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::markAllRead
* @see app/Http/Controllers/SystemEventController.php:66
* @route '/api/system-events/read-all'
*/
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::markAllRead
* @see app/Http/Controllers/SystemEventController.php:66
* @route '/api/system-events/read-all'
*/
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::markAllRead
* @see app/Http/Controllers/SystemEventController.php:66
* @route '/api/system-events/read-all'
*/
const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::markAllRead
* @see app/Http/Controllers/SystemEventController.php:66
* @route '/api/system-events/read-all'
*/
markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllRead.url(options),
    method: 'post',
})

markAllRead.form = markAllReadForm

/**
* @see \App\Http\Controllers\SystemEventController::destroyAll
* @see app/Http/Controllers/SystemEventController.php:123
* @route '/api/system-events/clear-all'
*/
export const destroyAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyAll.url(options),
    method: 'post',
})

destroyAll.definition = {
    methods: ["post"],
    url: '/api/system-events/clear-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::destroyAll
* @see app/Http/Controllers/SystemEventController.php:123
* @route '/api/system-events/clear-all'
*/
destroyAll.url = (options?: RouteQueryOptions) => {
    return destroyAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::destroyAll
* @see app/Http/Controllers/SystemEventController.php:123
* @route '/api/system-events/clear-all'
*/
destroyAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::destroyAll
* @see app/Http/Controllers/SystemEventController.php:123
* @route '/api/system-events/clear-all'
*/
const destroyAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::destroyAll
* @see app/Http/Controllers/SystemEventController.php:123
* @route '/api/system-events/clear-all'
*/
destroyAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAll.url(options),
    method: 'post',
})

destroyAll.form = destroyAllForm

/**
* @see \App\Http\Controllers\SystemEventController::markRead
* @see app/Http/Controllers/SystemEventController.php:52
* @route '/api/system-events/{systemEvent}/read'
*/
export const markRead = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/api/system-events/{systemEvent}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::markRead
* @see app/Http/Controllers/SystemEventController.php:52
* @route '/api/system-events/{systemEvent}/read'
*/
markRead.url = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { systemEvent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { systemEvent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            systemEvent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        systemEvent: typeof args.systemEvent === 'object'
        ? args.systemEvent.id
        : args.systemEvent,
    }

    return markRead.definition.url
            .replace('{systemEvent}', parsedArgs.systemEvent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::markRead
* @see app/Http/Controllers/SystemEventController.php:52
* @route '/api/system-events/{systemEvent}/read'
*/
markRead.post = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::markRead
* @see app/Http/Controllers/SystemEventController.php:52
* @route '/api/system-events/{systemEvent}/read'
*/
const markReadForm = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::markRead
* @see app/Http/Controllers/SystemEventController.php:52
* @route '/api/system-events/{systemEvent}/read'
*/
markReadForm.post = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markRead.url(args, options),
    method: 'post',
})

markRead.form = markReadForm

/**
* @see \App\Http\Controllers\SystemEventController::destroy
* @see app/Http/Controllers/SystemEventController.php:109
* @route '/api/system-events/{systemEvent}'
*/
export const destroy = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/system-events/{systemEvent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SystemEventController::destroy
* @see app/Http/Controllers/SystemEventController.php:109
* @route '/api/system-events/{systemEvent}'
*/
destroy.url = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { systemEvent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { systemEvent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            systemEvent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        systemEvent: typeof args.systemEvent === 'object'
        ? args.systemEvent.id
        : args.systemEvent,
    }

    return destroy.definition.url
            .replace('{systemEvent}', parsedArgs.systemEvent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::destroy
* @see app/Http/Controllers/SystemEventController.php:109
* @route '/api/system-events/{systemEvent}'
*/
destroy.delete = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SystemEventController::destroy
* @see app/Http/Controllers/SystemEventController.php:109
* @route '/api/system-events/{systemEvent}'
*/
const destroyForm = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::destroy
* @see app/Http/Controllers/SystemEventController.php:109
* @route '/api/system-events/{systemEvent}'
*/
destroyForm.delete = (args: { systemEvent: number | { id: number } } | [systemEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
export const push = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

push.definition = {
    methods: ["post"],
    url: '/api/system-events/push',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
push.url = (options?: RouteQueryOptions) => {
    return push.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
push.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
const pushForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SystemEventController::push
* @see app/Http/Controllers/SystemEventController.php:79
* @route '/api/system-events/push'
*/
pushForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: push.url(options),
    method: 'post',
})

push.form = pushForm

const SystemEventController = { index, store, markAllRead, destroyAll, markRead, destroy, push }

export default SystemEventController