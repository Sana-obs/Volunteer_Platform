<?php

namespace App\Providers;

use App\Models\Participation;
use App\Observers\ParticipationObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Participation::observe(ParticipationObserver::class);
    }
}
