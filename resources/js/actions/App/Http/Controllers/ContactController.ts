import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ContactController::index
* @see app/Http/Controllers/ContactController.php:16
* @route '/addressbooks/{addressbook}/contacts'
*/
export const index = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/addressbooks/{addressbook}/contacts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ContactController::index
* @see app/Http/Controllers/ContactController.php:16
* @route '/addressbooks/{addressbook}/contacts'
*/
index.url = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { addressbook: args }
    }

    if (Array.isArray(args)) {
        args = {
            addressbook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        addressbook: args.addressbook,
    }

    return index.definition.url
            .replace('{addressbook}', parsedArgs.addressbook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ContactController::index
* @see app/Http/Controllers/ContactController.php:16
* @route '/addressbooks/{addressbook}/contacts'
*/
index.get = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ContactController::index
* @see app/Http/Controllers/ContactController.php:16
* @route '/addressbooks/{addressbook}/contacts'
*/
index.head = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ContactController::store
* @see app/Http/Controllers/ContactController.php:62
* @route '/addressbooks/{addressbook}/contacts'
*/
export const store = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/addressbooks/{addressbook}/contacts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ContactController::store
* @see app/Http/Controllers/ContactController.php:62
* @route '/addressbooks/{addressbook}/contacts'
*/
store.url = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { addressbook: args }
    }

    if (Array.isArray(args)) {
        args = {
            addressbook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        addressbook: args.addressbook,
    }

    return store.definition.url
            .replace('{addressbook}', parsedArgs.addressbook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ContactController::store
* @see app/Http/Controllers/ContactController.php:62
* @route '/addressbooks/{addressbook}/contacts'
*/
store.post = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ContactController::update
* @see app/Http/Controllers/ContactController.php:76
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
export const update = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/addressbooks/{addressbook}/contacts/{contact}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ContactController::update
* @see app/Http/Controllers/ContactController.php:76
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
update.url = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            addressbook: args[0],
            contact: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        addressbook: args.addressbook,
        contact: args.contact,
    }

    return update.definition.url
            .replace('{addressbook}', parsedArgs.addressbook.toString())
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ContactController::update
* @see app/Http/Controllers/ContactController.php:76
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
update.put = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ContactController::destroy
* @see app/Http/Controllers/ContactController.php:91
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
export const destroy = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/addressbooks/{addressbook}/contacts/{contact}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ContactController::destroy
* @see app/Http/Controllers/ContactController.php:91
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
destroy.url = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            addressbook: args[0],
            contact: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        addressbook: args.addressbook,
        contact: args.contact,
    }

    return destroy.definition.url
            .replace('{addressbook}', parsedArgs.addressbook.toString())
            .replace('{contact}', parsedArgs.contact.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ContactController::destroy
* @see app/Http/Controllers/ContactController.php:91
* @route '/addressbooks/{addressbook}/contacts/{contact}'
*/
destroy.delete = (args: { addressbook: string | number, contact: string | number } | [addressbook: string | number, contact: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ContactController::bulkDestroy
* @see app/Http/Controllers/ContactController.php:101
* @route '/addressbooks/{addressbook}/contacts/bulk-delete'
*/
export const bulkDestroy = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/addressbooks/{addressbook}/contacts/bulk-delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ContactController::bulkDestroy
* @see app/Http/Controllers/ContactController.php:101
* @route '/addressbooks/{addressbook}/contacts/bulk-delete'
*/
bulkDestroy.url = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { addressbook: args }
    }

    if (Array.isArray(args)) {
        args = {
            addressbook: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        addressbook: args.addressbook,
    }

    return bulkDestroy.definition.url
            .replace('{addressbook}', parsedArgs.addressbook.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ContactController::bulkDestroy
* @see app/Http/Controllers/ContactController.php:101
* @route '/addressbooks/{addressbook}/contacts/bulk-delete'
*/
bulkDestroy.post = (args: { addressbook: string | number } | [addressbook: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

const ContactController = { index, store, update, destroy, bulkDestroy }

export default ContactController