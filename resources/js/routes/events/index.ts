import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
export const index = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/calendars/{calendar}/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
index.url = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendar: args }
    }

    if (Array.isArray(args)) {
        args = {
            calendar: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendar: args.calendar,
    }

    return index.definition.url
            .replace('{calendar}', parsedArgs.calendar.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
index.get = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
index.head = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
const indexForm = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
indexForm.get = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\EventController::index
* @see app/Http/Controllers/EventController.php:16
* @route '/calendars/{calendar}/events'
*/
indexForm.head = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\EventController::store
* @see app/Http/Controllers/EventController.php:60
* @route '/calendars/{calendar}/events'
*/
export const store = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/calendars/{calendar}/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EventController::store
* @see app/Http/Controllers/EventController.php:60
* @route '/calendars/{calendar}/events'
*/
store.url = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendar: args }
    }

    if (Array.isArray(args)) {
        args = {
            calendar: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendar: args.calendar,
    }

    return store.definition.url
            .replace('{calendar}', parsedArgs.calendar.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EventController::store
* @see app/Http/Controllers/EventController.php:60
* @route '/calendars/{calendar}/events'
*/
store.post = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::store
* @see app/Http/Controllers/EventController.php:60
* @route '/calendars/{calendar}/events'
*/
const storeForm = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::store
* @see app/Http/Controllers/EventController.php:60
* @route '/calendars/{calendar}/events'
*/
storeForm.post = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\EventController::update
* @see app/Http/Controllers/EventController.php:75
* @route '/calendars/{calendar}/events/{event}'
*/
export const update = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/calendars/{calendar}/events/{event}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\EventController::update
* @see app/Http/Controllers/EventController.php:75
* @route '/calendars/{calendar}/events/{event}'
*/
update.url = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            calendar: args[0],
            event: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendar: args.calendar,
        event: args.event,
    }

    return update.definition.url
            .replace('{calendar}', parsedArgs.calendar.toString())
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EventController::update
* @see app/Http/Controllers/EventController.php:75
* @route '/calendars/{calendar}/events/{event}'
*/
update.put = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\EventController::update
* @see app/Http/Controllers/EventController.php:75
* @route '/calendars/{calendar}/events/{event}'
*/
const updateForm = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::update
* @see app/Http/Controllers/EventController.php:75
* @route '/calendars/{calendar}/events/{event}'
*/
updateForm.put = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\EventController::destroy
* @see app/Http/Controllers/EventController.php:94
* @route '/calendars/{calendar}/events/{event}'
*/
export const destroy = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/calendars/{calendar}/events/{event}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\EventController::destroy
* @see app/Http/Controllers/EventController.php:94
* @route '/calendars/{calendar}/events/{event}'
*/
destroy.url = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            calendar: args[0],
            event: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendar: args.calendar,
        event: args.event,
    }

    return destroy.definition.url
            .replace('{calendar}', parsedArgs.calendar.toString())
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EventController::destroy
* @see app/Http/Controllers/EventController.php:94
* @route '/calendars/{calendar}/events/{event}'
*/
destroy.delete = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\EventController::destroy
* @see app/Http/Controllers/EventController.php:94
* @route '/calendars/{calendar}/events/{event}'
*/
const destroyForm = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::destroy
* @see app/Http/Controllers/EventController.php:94
* @route '/calendars/{calendar}/events/{event}'
*/
destroyForm.delete = (args: { calendar: string | number, event: string | number } | [calendar: string | number, event: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\EventController::bulkDestroy
* @see app/Http/Controllers/EventController.php:109
* @route '/calendars/{calendar}/events/bulk-delete'
*/
export const bulkDestroy = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/calendars/{calendar}/events/bulk-delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EventController::bulkDestroy
* @see app/Http/Controllers/EventController.php:109
* @route '/calendars/{calendar}/events/bulk-delete'
*/
bulkDestroy.url = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendar: args }
    }

    if (Array.isArray(args)) {
        args = {
            calendar: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendar: args.calendar,
    }

    return bulkDestroy.definition.url
            .replace('{calendar}', parsedArgs.calendar.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\EventController::bulkDestroy
* @see app/Http/Controllers/EventController.php:109
* @route '/calendars/{calendar}/events/bulk-delete'
*/
bulkDestroy.post = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::bulkDestroy
* @see app/Http/Controllers/EventController.php:109
* @route '/calendars/{calendar}/events/bulk-delete'
*/
const bulkDestroyForm = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\EventController::bulkDestroy
* @see app/Http/Controllers/EventController.php:109
* @route '/calendars/{calendar}/events/bulk-delete'
*/
bulkDestroyForm.post = (args: { calendar: string | number } | [calendar: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(args, options),
    method: 'post',
})

bulkDestroy.form = bulkDestroyForm

const events = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
}

export default events