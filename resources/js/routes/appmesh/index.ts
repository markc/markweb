import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import dbus from './dbus'
/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
export const tools = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

tools.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
tools.url = (options?: RouteQueryOptions) => {
    return tools.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
tools.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
tools.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tools.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
const toolsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tools.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
toolsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tools.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tools
* @see app/Http/Controllers/AppMeshController.php:56
* @route '/api/appmesh/tools'
*/
toolsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tools.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

tools.form = toolsForm

/**
* @see \App\Http\Controllers\AppMeshController::execute
* @see app/Http/Controllers/AppMeshController.php:64
* @route '/api/appmesh/execute'
*/
export const execute = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/api/appmesh/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::execute
* @see app/Http/Controllers/AppMeshController.php:64
* @route '/api/appmesh/execute'
*/
execute.url = (options?: RouteQueryOptions) => {
    return execute.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::execute
* @see app/Http/Controllers/AppMeshController.php:64
* @route '/api/appmesh/execute'
*/
execute.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::execute
* @see app/Http/Controllers/AppMeshController.php:64
* @route '/api/appmesh/execute'
*/
const executeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: execute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::execute
* @see app/Http/Controllers/AppMeshController.php:64
* @route '/api/appmesh/execute'
*/
executeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: execute.url(options),
    method: 'post',
})

execute.form = executeForm

/**
* @see \App\Http\Controllers\AppMeshController::port
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
export const port = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: port.url(options),
    method: 'post',
})

port.definition = {
    methods: ["post"],
    url: '/api/appmesh/port',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::port
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
port.url = (options?: RouteQueryOptions) => {
    return port.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::port
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
port.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: port.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::port
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
const portForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: port.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::port
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
portForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: port.url(options),
    method: 'post',
})

port.form = portForm

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/appmesh',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::index
* @see app/Http/Controllers/AppMeshController.php:21
* @route '/appmesh'
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
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
export const explore = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: explore.url(options),
    method: 'get',
})

explore.definition = {
    methods: ["get","head"],
    url: '/appmesh/explore',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
explore.url = (options?: RouteQueryOptions) => {
    return explore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
explore.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: explore.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
explore.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: explore.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
const exploreForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: explore.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
exploreForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: explore.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::explore
* @see app/Http/Controllers/AppMeshController.php:32
* @route '/appmesh/explore'
*/
exploreForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: explore.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

explore.form = exploreForm

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
export const midi = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: midi.url(options),
    method: 'get',
})

midi.definition = {
    methods: ["get","head"],
    url: '/appmesh/midi',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
midi.url = (options?: RouteQueryOptions) => {
    return midi.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
midi.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: midi.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
midi.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: midi.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
const midiForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midi.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
midiForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midi.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midi
* @see app/Http/Controllers/AppMeshController.php:40
* @route '/appmesh/midi'
*/
midiForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midi.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

midi.form = midiForm

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
export const tts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tts.url(options),
    method: 'get',
})

tts.definition = {
    methods: ["get","head"],
    url: '/appmesh/tts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
tts.url = (options?: RouteQueryOptions) => {
    return tts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
tts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
tts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
const ttsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
ttsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::tts
* @see app/Http/Controllers/AppMeshController.php:48
* @route '/appmesh/tts'
*/
ttsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tts.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

tts.form = ttsForm

const appmesh = {
    tools: Object.assign(tools, tools),
    execute: Object.assign(execute, execute),
    port: Object.assign(port, port),
    dbus: Object.assign(dbus, dbus),
    midi: Object.assign(midi, midi),
    tts: Object.assign(tts, tts),
    index: Object.assign(index, index),
    explore: Object.assign(explore, explore),
}

export default appmesh