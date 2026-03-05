import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AppMeshController::voices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
export const voices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voices.url(options),
    method: 'get',
})

voices.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/tts/voices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::voices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
voices.url = (options?: RouteQueryOptions) => {
    return voices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::voices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
voices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::voices
* @see app/Http/Controllers/AppMeshController.php:170
* @route '/api/appmesh/tts/voices'
*/
voices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: voices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::generate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::generate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::generate
* @see app/Http/Controllers/AppMeshController.php:180
* @route '/api/appmesh/tts/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::play
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
export const play = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: play.url(options),
    method: 'get',
})

play.definition = {
    methods: ["get","head"],
    url: '/api/appmesh/tts/play',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AppMeshController::play
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
play.url = (options?: RouteQueryOptions) => {
    return play.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::play
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
play.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: play.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AppMeshController::play
* @see app/Http/Controllers/AppMeshController.php:200
* @route '/api/appmesh/tts/play'
*/
play.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: play.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AppMeshController::tutorial
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
export const tutorial = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorial.url(options),
    method: 'post',
})

tutorial.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/tutorial',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::tutorial
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
tutorial.url = (options?: RouteQueryOptions) => {
    return tutorial.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::tutorial
* @see app/Http/Controllers/AppMeshController.php:220
* @route '/api/appmesh/tts/tutorial'
*/
tutorial.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: tutorial.url(options),
    method: 'post',
})

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
* @see \App\Http\Controllers\AppMeshController::record
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
export const record = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: record.url(options),
    method: 'post',
})

record.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/record',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::record
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
record.url = (options?: RouteQueryOptions) => {
    return record.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::record
* @see app/Http/Controllers/AppMeshController.php:256
* @route '/api/appmesh/tts/record'
*/
record.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: record.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AppMeshController::combine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
export const combine = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: combine.url(options),
    method: 'post',
})

combine.definition = {
    methods: ["post"],
    url: '/api/appmesh/tts/combine',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AppMeshController::combine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
combine.url = (options?: RouteQueryOptions) => {
    return combine.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AppMeshController::combine
* @see app/Http/Controllers/AppMeshController.php:274
* @route '/api/appmesh/tts/combine'
*/
combine.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: combine.url(options),
    method: 'post',
})

