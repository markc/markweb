import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:73
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
* @see app/Http/Controllers/Chat/ChatChannelController.php:73
* @route '/text-chat/channels'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:73
* @route '/text-chat/channels'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:73
* @route '/text-chat/channels'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Chat\ChatChannelController::store
* @see app/Http/Controllers/Chat/ChatChannelController.php:73
* @route '/text-chat/channels'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const channels = {
    store: Object.assign(store, store),
}

export default channels