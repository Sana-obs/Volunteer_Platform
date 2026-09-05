<?php
// app/Http/Controllers/Api/StatsController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Response;

class StatsController extends Controller
{
    /**
     * GET /stats/summary
     */
    public function summary()
    {
        $data = $this->coreStats();

        return ApiResponse::getResponse($data, Response::HTTP_OK, 'Stats retrieved successfully');
    }

    /**
     * GET /admin/dashboard — تجميع بديل لثلاث كولز منفصلة كانت عالفرونت اند (stats + categories + org list)
     */
    public function adminDashboard()
    {
        $data = [
            'stats'                => $this->coreStats(),
            'categories'           => CategoryResource::collection(Category::withCount('opportunities')->get()),
            'pendingOrganizations' => OrganizationResource::collection(
                Organization::with(['user', 'governorate'])
                    ->where('status', 'pending')
                    ->latest()
                    ->paginate(15)
            ),
        ];

        return ApiResponse::getResponse($data, Response::HTTP_OK, 'Admin dashboard retrieved successfully');
    }

    private function coreStats(): array
    {
        return [
            'volunteersCount'    => User::role('volunteer')->count(),
            'organizationsCount' => Organization::count(),
            'opportunitiesCount' => Opportunity::count(),
            'citiesCoveredCount' => Governorate::where('is_active', true)->count(),
        ];
    }
}
