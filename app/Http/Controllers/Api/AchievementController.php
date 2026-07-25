<?php
// app/Http/Controllers/Api/AchievementController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Models\Volunteer;
use Illuminate\Http\Request;

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
        // بيفترض إنو المستخدم المسجل مرتبط بسجل volunteer (عدّلي حسب علاقتكن الفعلية)
        $volunteer = $request->user()->volunteer ?? abort(404, 'Volunteer profile not found');

        return $this->buildResponse($volunteer);
    }

    // private function buildResponse(Volunteer $volunteer)
    // {
    //     // نجيب كل الكتالوج، مع الـ pivot الخاص فيها المتطوع (إذا موجود) لكل وحدة
    //     $pivots = $volunteer->volunteerAchievements()->get()->keyBy('achievement_id');

    //     $achievements = Achievement::all()->map(function ($achievement) use ($pivots) {
    //         $achievement->volunteerPivot = $pivots->get($achievement->id);
    //         return $achievement;
    //     });

    //     return AchievementResource::collection($achievements);
    // }
    private function buildResponse(Volunteer $volunteer)
{
    // نربط الـ pivot بـ achievement_id الموجود بجدول الربط مع id الإنجاز
    $pivots = $volunteer->volunteerAchievements()->get()->keyBy('achievement_id');

    $achievements = Achievement::all()->map(function ($achievement) use ($pivots) {
        $achievement->volunteerPivot = $pivots->get($achievement->id);
        return $achievement;
    });

    return AchievementResource::collection($achievements);
}
}