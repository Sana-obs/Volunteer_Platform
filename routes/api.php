<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\AchievementController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/volunteer/complete-profile', [VolunteerController::class, 'store']);
    Route::get('/volunteer/profile', [VolunteerController::class, 'show']);
    Route::put('/volunteer/profile', [VolunteerController::class, 'update']);
    Route::delete('/volunteer/profile', [VolunteerController::class, 'destroy']);

    Route::post('/achievements', [AchievementController::class, 'store']);
    Route::put('/achievements/{id}', [AchievementController::class, 'update']);
    Route::delete('/achievements/{id}', [AchievementController::class, 'destroy']);
});

Route::get('/volunteers', [VolunteerController::class, 'index'])->middleware('auth:sanctum');
Route::get('/achievements', [AchievementController::class, 'index']);
Route::get('/achievements/{id}', [AchievementController::class, 'show']);