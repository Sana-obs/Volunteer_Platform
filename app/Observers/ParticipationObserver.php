<?php

namespace App\Observers;

use App\Models\Participation;

class ParticipationObserver
{
    /**
     * Handle the Participation "created" event.
     */
    public function created(Participation $participation): void
    {
        //
    }

    /**
     * Handle the Participation "updated" event.
     */
    public function updated(Participation $participation): void
    {
        //
    }

    /**
     * Handle the Participation "deleted" event.
     */
    public function deleted(Participation $participation): void
    {
        //
    }

    /**
     * Handle the Participation "restored" event.
     */
    public function restored(Participation $participation): void
    {
        //
    }

    /**
     * Handle the Participation "force deleted" event.
     */
    public function forceDeleted(Participation $participation): void
    {
        //
    }
}
