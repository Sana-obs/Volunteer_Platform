<?php
// app/Http/Controllers/Api/AchievementController.php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AchievementController extends Controller
{
    // GET /api/volunteers/{id}/achievements
    public function forVolunteer(Volunteer $volunteer)
    {
        return $this->buildResponse($volunteer);
    }

    // GET /api/volunteers/me/achievements
    public function forMe(Request $request)
    {
        $volunteer = $request->user()->volunteer ?? abort(404, 'Volunteer profile not found');

        return $this->buildResponse($volunteer);
    }

    private function buildResponse(Volunteer $volunteer)
{
    $pivots = $volunteer->volunteerAchievements()->get()->keyBy('achievement_id');

    $completedCount = $volunteer->participations()->where('status', \App\Enum\ParticipationStatus::Accepted)
        ->whereHas('opportunity', fn ($q) => $q->where('end_date', '<=', now()))->count();
    $totalHours = $volunteer->participations()->where('status', \App\Enum\ParticipationStatus::Accepted)->sum('hours_logged');
    $groupCount = $volunteer->participations()->where('status', \App\Enum\ParticipationStatus::Accepted)
        ->whereHas('opportunity', fn ($q) => $q->where('end_date', '<=', now())->where('is_group', true))->count();

    $progressByCode = [
        'a1' => ['current' => min($completedCount, 1), 'target' => 1],
        'a2' => ['current' => min($totalHours, 10),    'target' => 10],
        'a3' => ['current' => min($groupCount, 3),     'target' => 3],
    ];

    $achievements = Achievement::all()->map(function ($achievement) use ($pivots, $progressByCode) {
        $achievement->volunteerPivot = $pivots->get($achievement->id);
        $achievement->progress = $progressByCode[$achievement->code] ?? null;
        return $achievement;
    });

    return ApiResponse::getResponse(AchievementResource::collection($achievements), Response::HTTP_OK, 'Achievements retrieved successfully');
}
}
