<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\OrganizationController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Routes عامة
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

Route::apiResource('organizations', OrganizationController::class)->only(['index', 'show']);

Route::apiResource('volunteers', VolunteerController::class)->only(['index', 'show']);

// Routes محمية
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [UserController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('categories', CategoryController::class)
        ->except(['index', 'show']);

    Route::apiResource('organizations', OrganizationController::class)
        ->except(['index', 'show']);

    Route::apiResource('volunteers', VolunteerController::class)
        ->except(['index', 'show']);
});
