<?php
// app/Services/AchievementService.php

namespace App\Services;

use App\Models\Achievement;
use App\Models\Volunteer;
use App\Models\VolunteerAchievement;
use Carbon\Carbon;

class AchievementService
{
    public function evaluate(Volunteer $volunteer): void
    {
        $this->checkFirstOpportunity($volunteer);
        $this->checkTenHours($volunteer);
        $this->checkThreeGroupActivities($volunteer);
    }

    private function checkFirstOpportunity(Volunteer $volunteer): void
    {
        $achieved = $volunteer->participations()
            ->where('status', 'completed')
            ->exists();

        if ($achieved) {
            $this->unlock($volunteer, 'a1');
        }
    }

    private function checkTenHours(Volunteer $volunteer): void
    {
        $totalHours = $volunteer->participations()->sum('hoursCompleted');

        if ($totalHours >= 10) {
            $this->unlock($volunteer, 'a2');
        }
    }

    private function checkThreeGroupActivities(Volunteer $volunteer): void
    {
        $count = $volunteer->participations()
            ->where('status', 'completed')
            ->whereHas('opportunity', fn ($q) => $q->where('isGroup', true))
            ->count();

        if ($count >= 3) {
            $this->unlock($volunteer, 'a3');
        }
    }

    private function unlock(Volunteer $volunteer, string $code): void
    {
        $achievement = Achievement::query()
            ->where('code', '=', $code, 'and')
            ->first();

        if (! $achievement) {
            return; 
        }

        $existing = VolunteerAchievement::firstOrCreate(
            [
                'volunteer_id'   => $volunteer->id,
                'achievement_id' => $achievement->id,
            ],
            [
                'unlocked'    => false,
                'earned_date' => null,
            ]
        );

        if (! $existing->unlocked) {
            $existing->update([
                'unlocked'    => true,
                'earned_date' => Carbon::now()->toDateString(),
            ]);
        }
    }
}