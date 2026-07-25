<?php

use App\Http\Controllers\Api\AchievementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('volunteers/me/achievements', [AchievementController::class, 'forMe']);
    Route::get('volunteers/{volunteer}/achievements', [AchievementController::class, 'forVolunteer']);
});
