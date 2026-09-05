<?php

use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AdminMonitoringController;
use App\Http\Controllers\Api\AdminProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClassifierController;
use App\Http\Controllers\Api\GovernorateController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ParticipationController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VolunteerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public — no auth required
|--------------------------------------------------------------------------
*/

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Organizations directory (§17.3) — supports ?status= and ?search=, filtered before pagination
Route::get('/organizations', [OrganizationController::class, 'index']);
Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);

// Opportunities browsing (§17.1)
Route::get('/opportunities', [OpportunityController::class, 'index']);
Route::get('/opportunities/{opportunity}', [OpportunityController::class, 'show']);

// Catalog — read-only, mutations are admin-only (below)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/{skill}', [SkillController::class, 'show']);

Route::get('/governorates', [GovernorateController::class, 'index']);

// Platform stats — used publicly on Home/About, no auth required
Route::get('/stats/summary', [StatsController::class, 'summary']);

/*
|--------------------------------------------------------------------------
| Shared — any authenticated user, regardless of role
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // IMPORTANT: /me must come before /{volunteer}
    Route::get('/volunteers/me/achievements', [AchievementController::class, 'forMe']);
    Route::get('/volunteers/{volunteer}/achievements', [AchievementController::class, 'forVolunteer']);
});

/*
|--------------------------------------------------------------------------
| Volunteer-only (§4, §10)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:volunteer'])->group(function () {

    // Profile (§5.7)
    Route::post('/volunteers', [VolunteerController::class, 'store']);
    Route::get('/volunteers/me', [VolunteerController::class, 'show']);
    Route::put('/volunteers/me', [VolunteerController::class, 'update']);
    Route::delete('/volunteers/me', [VolunteerController::class, 'destroy']);
    Route::post('/volunteers/me/skills', [VolunteerController::class, 'syncSkills']);
    Route::get('/volunteers/me/participations', [ParticipationController::class, 'myParticipations']);
    Route::get('/volunteers/me/suggested-opportunities', [OpportunityController::class, 'suggestedForMe']);
    Route::post('/opportunities/classify', [ClassifierController::class, 'classify']);

    // Participation lifecycle — volunteer side (§8)
    Route::post('/opportunities/{opportunity}/participate', [ParticipationController::class, 'store']);
    Route::patch('/participations/{participation}/withdraw', [ParticipationController::class, 'withdraw']);
});

/*
|--------------------------------------------------------------------------
| Organization-only (§4, §11)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:organization'])->group(function () {

    // Profile — governorate_id is set/changed here only, never at registration
    Route::post('/organizations', [OrganizationController::class, 'store']);
    Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);
    Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy']);
    Route::post('/organizations/{organization}/verification-document', [OrganizationController::class, 'reuploadVerificationDocument']);

    // Opportunity management — ownership + verified-status enforced in the controller (§7, §21.13)
    Route::post('/opportunities', [OpportunityController::class, 'store']);
    Route::post('/opportunities/{opportunity}', [OpportunityController::class, 'update']); // + _method=PUT, multipart
    Route::delete('/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);
    Route::patch('/opportunities/{opportunity}/status', [OpportunityController::class, 'updateStatus']);
    Route::get('/opportunities/{opportunity}/participants', [ParticipationController::class, 'index']);

    // Participation lifecycle — organization side (§8)
    Route::patch('/participations/{participation}/decide', [ParticipationController::class, 'decide']);
    Route::patch('/participations/{participation}/hours', [ParticipationController::class, 'logHours']);
});

/*
|--------------------------------------------------------------------------
| Admin-only (§12) — requires the "role" middleware alias registered
| in bootstrap/app.php (Spatie RoleMiddleware)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:platform-admin'])
    ->prefix('admin')
    ->group(function () {

        // Organization review — supports ?status= and ?search=, same as the public index
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::patch('/organizations/{organization}/verify', [OrganizationController::class, 'verify']);

        // Catalog CRUD
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::post('/skills', [SkillController::class, 'store']);
        Route::put('/skills/{skill}', [SkillController::class, 'update']);
        Route::delete('/skills/{skill}', [SkillController::class, 'destroy']);

        Route::post('/governorates', [GovernorateController::class, 'store']);
        Route::put('/governorates/{governorate}', [GovernorateController::class, 'update']);
        Route::patch('/governorates/{governorate}/status', [GovernorateController::class, 'toggleStatus']);

        // Read-only platform monitoring
        Route::get('/volunteers', [AdminMonitoringController::class, 'volunteers']);
        Route::get('/opportunities', [AdminMonitoringController::class, 'opportunities']);

        // Admin self-service
        Route::put('/profile', [AdminProfileController::class, 'update']);
        Route::put('/password', [AdminProfileController::class, 'updatePassword']);

        Route::get('/dashboard', [StatsController::class, 'adminDashboard']);
    });
