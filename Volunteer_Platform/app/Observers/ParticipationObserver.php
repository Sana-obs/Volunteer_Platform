<?php

namespace App\Observers;

use App\Models\Participation;
use App\Services\AchievementService;

class ParticipationObserver
{
    public function __construct(private AchievementService $achievementService) {}

    public function created(Participation $participation): void
    {
        $this->evaluate($participation);
    }

    public function updated(Participation $participation): void
    {
        if ($participation->wasChanged(['status', 'hours_logged'])) {
            $this->evaluate($participation);
        }
    }

    private function evaluate(Participation $participation): void
    {
        // volunteer() على Participation بترجع User — لازم بروفايل الـ Volunteer الفعلي
        $volunteerProfile = $participation->volunteer?->volunteer;

        if ($volunteerProfile) {
            $this->achievementService->evaluate($volunteerProfile);
        }
    }
}
