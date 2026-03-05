import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
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

const EventController = { index, store, update, destroy, bulkDestroy }

export default EventController