import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::index
* @see app/Http/Controllers/MailController.php:11
* @route '/mail'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/mail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::index
* @see app/Http/Controllers/MailController.php:11
* @route '/mail'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::index
* @see app/Http/Controllers/MailController.php:11
* @route '/mail'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MailController::index
* @see app/Http/Controllers/MailController.php:11
* @route '/mail'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const mail = {
    index: Object.assign(index, index),
}

export default mail