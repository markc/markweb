import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\AppMeshController::portExecute
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
export const portExecute = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: portExecute.url(options),
    method: 'post',
})

portExecute.definition = {
    methods: ["post"],
    url: '/api/appmesh/port',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::portExecute
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
portExecute.url = (options?: RouteQueryOptions) => {
    return portExecute.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::portExecute
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
portExecute.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: portExecute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::portExecute
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
const portExecuteForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: portExecute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::portExecute
* @see app/Http/Controllers/AppMeshController.php:82
* @route '/api/appmesh/port'
*/
portExecuteForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: portExecute.url(options),
    method: 'post',
})

portExecute.form = portExecuteForm

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
export const dbusServices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dbusServices.url(options),
    method: 'get',
})

dbusServices.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/dbus/services',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
dbusServices.url = (options?: RouteQueryOptions) => {
    return dbusServices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
dbusServices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dbusServices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
dbusServices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dbusServices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
const dbusServicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dbusServices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
dbusServicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dbusServices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusServices
* @see app/Http/Controllers/AppMeshController.php:102
* @route '/api/appmesh/dbus/services'
*/
dbusServicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dbusServices.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dbusServices.form = dbusServicesForm

/**
* @see \App\Http\Controllers\AppMeshController::dbusIntrospect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
export const dbusIntrospect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dbusIntrospect.url(options),
    method: 'post',
})

dbusIntrospect.definition = {
    methods: ["post"],
    url: '/api/appmesh/dbus/introspect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::dbusIntrospect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
dbusIntrospect.url = (options?: RouteQueryOptions) => {
    return dbusIntrospect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::dbusIntrospect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
dbusIntrospect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dbusIntrospect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusIntrospect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
const dbusIntrospectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dbusIntrospect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::dbusIntrospect
* @see app/Http/Controllers/AppMeshController.php:114
* @route '/api/appmesh/dbus/introspect'
*/
dbusIntrospectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: dbusIntrospect.url(options),
    method: 'post',
})

dbusIntrospect.form = dbusIntrospectForm

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
export const midiPorts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: midiPorts.url(options),
    method: 'get',
})

midiPorts.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/midi/ports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
midiPorts.url = (options?: RouteQueryOptions) => {
    return midiPorts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
midiPorts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: midiPorts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
midiPorts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: midiPorts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
const midiPortsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midiPorts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
midiPortsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midiPorts.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiPorts
* @see app/Http/Controllers/AppMeshController.php:133
* @route '/api/appmesh/midi/ports'
*/
midiPortsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: midiPorts.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

midiPorts.form = midiPortsForm

/**
* @see \App\Http\Controllers\AppMeshController::midiConnect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
export const midiConnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: midiConnect.url(options),
    method: 'post',
})

midiConnect.definition = {
    methods: ["post"],
    url: '/api/appmesh/midi/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::midiConnect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
midiConnect.url = (options?: RouteQueryOptions) => {
    return midiConnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::midiConnect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
midiConnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: midiConnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiConnect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
const midiConnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: midiConnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::midiConnect
* @see app/Http/Controllers/AppMeshController.php:147
* @route '/api/appmesh/midi/connect'
*/
midiConnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: midiConnect.url(options),
    method: 'post',
})

midiConnect.form = midiConnectForm

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
export const ttsVoices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ttsVoices.url(options),
    method: 'get',
})

ttsVoices.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/tts/voices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
ttsVoices.url = (options?: RouteQueryOptions) => {
    return ttsVoices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
ttsVoices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ttsVoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
ttsVoices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ttsVoices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
const ttsVoicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsVoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
ttsVoicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsVoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsVoices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
ttsVoicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsVoices.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ttsVoices.form = ttsVoicesForm

/**
* @see \App\Http\Controllers\AppMeshController::ttsGenerate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
export const ttsGenerate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ttsGenerate.url(options),
    method: 'post',
})

ttsGenerate.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::ttsGenerate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
ttsGenerate.url = (options?: RouteQueryOptions) => {
    return ttsGenerate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::ttsGenerate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
ttsGenerate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ttsGenerate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsGenerate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
const ttsGenerateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ttsGenerate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsGenerate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
ttsGenerateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ttsGenerate.url(options),
    method: 'post',
})

ttsGenerate.form = ttsGenerateForm

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
export const ttsPlay = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ttsPlay.url(options),
    method: 'get',
})

ttsPlay.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/tts/play',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
ttsPlay.url = (options?: RouteQueryOptions) => {
    return ttsPlay.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
ttsPlay.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ttsPlay.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
ttsPlay.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ttsPlay.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
const ttsPlayForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsPlay.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
ttsPlayForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsPlay.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::ttsPlay
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
ttsPlayForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ttsPlay.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ttsPlay.form = ttsPlayForm

/**
* @see \App\Http\Controllers\AppMeshController::tutorialScript
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
export const tutorialScript = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorialScript.url(options),
    method: 'post',
})

tutorialScript.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/tutorial',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::tutorialScript
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
tutorialScript.url = (options?: RouteQueryOptions) => {
    return tutorialScript.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::tutorialScript
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
tutorialScript.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorialScript.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::tutorialScript
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
const tutorialScriptForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: tutorialScript.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::tutorialScript
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
tutorialScriptForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: tutorialScript.url(options),
    method: 'post',
})

tutorialScript.form = tutorialScriptForm

/**
* @see \App\Http\Controllers\AppMeshController::tutorialFull
* @see app/Http/Controllers/AppMeshController.php:236
* @route '/api/appmesh/tts/tutorial-full'
*/
export const tutorialFull = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorialFull.url(options),
    method: 'post',
})

tutorialFull.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/tutorial-full',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::tutorialFull
* @see app/Http/Controllers/AppMeshController.php:236
* @route '/api/appmesh/tts/tutorial-full'
*/
tutorialFull.url = (options?: RouteQueryOptions) => {
    return tutorialFull.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::tutorialFull
* @see app/Http/Controllers/AppMeshController.php:236
* @route '/api/appmesh/tts/tutorial-full'
*/
tutorialFull.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorialFull.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::tutorialFull
* @see app/Http/Controllers/AppMeshController.php:236
* @route '/api/appmesh/tts/tutorial-full'
*/
const tutorialFullForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: tutorialFull.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::tutorialFull
* @see app/Http/Controllers/AppMeshController.php:236
* @route '/api/appmesh/tts/tutorial-full'
*/
tutorialFullForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: tutorialFull.url(options),
    method: 'post',
})

tutorialFull.form = tutorialFullForm

/**
* @see \App\Http\Controllers\AppMeshController::screenRecord
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
export const screenRecord = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: screenRecord.url(options),
    method: 'post',
})

screenRecord.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/record',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::screenRecord
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
screenRecord.url = (options?: RouteQueryOptions) => {
    return screenRecord.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::screenRecord
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
screenRecord.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: screenRecord.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::screenRecord
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
const screenRecordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: screenRecord.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::screenRecord
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
screenRecordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: screenRecord.url(options),
    method: 'post',
})

screenRecord.form = screenRecordForm

/**
* @see \App\Http\Controllers\AppMeshController::videoCombine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
export const videoCombine = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: videoCombine.url(options),
    method: 'post',
})

videoCombine.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/combine',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::videoCombine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
videoCombine.url = (options?: RouteQueryOptions) => {
    return videoCombine.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::videoCombine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
videoCombine.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: videoCombine.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::videoCombine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
const videoCombineForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: videoCombine.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::videoCombine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
videoCombineForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: videoCombine.url(options),
    method: 'post',
})

videoCombine.form = videoCombineForm

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

const AppMeshController = { tools, execute, portExecute, dbusServices, dbusIntrospect, midiPorts, midiConnect, ttsVoices, ttsGenerate, ttsPlay, tutorialScript, tutorialFull, screenRecord, videoCombine, index, explore, midi, tts }

export default AppMeshController