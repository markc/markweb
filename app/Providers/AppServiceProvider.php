<?php

namespace App\Providers;

use App\Services\Search\EngineRegistry;
use App\Services\Search\Engines\BingEngine;
use App\Services\Search\Engines\BraveApiEngine;
use App\Services\Search\Engines\DuckDuckGoEngine;
use App\Services\Search\Engines\GoogleEngine;
use App\Services\Search\Engines\GoogleImagesEngine;
use App\Services\Search\Engines\YouTubeEngine;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(EngineRegistry::class, function () {
            $registry = new EngineRegistry;

            foreach ([
                new BraveApiEngine,
                new DuckDuckGoEngine,
                new GoogleEngine,
                new BingEngine,
                new YouTubeEngine,
                new GoogleImagesEngine,
            ] as $engine) {
                $registry->register($engine);
            }

            return $registry;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\Chat\MessageSent::class,
            \App\Listeners\Chat\ForwardMessageToMesh::class,
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
