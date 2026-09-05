<?php

namespace App\Http\Controllers\Api;

use App\Enum\OpportunityStatus;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OpportunityResource;
use App\Http\Resources\VolunteerResource;
use App\Models\Opportunity;
use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminMonitoringController extends Controller
{
    /**
     * GET /admin/volunteers
     */
    public function volunteers(Request $request)
    {
        $volunteers=Volunteer::with(['user', 'governorate', 'skills.category'])
            ->when($request->filled('governorateId'), fn ($q) => $q->where('governorate_id', $request->governorateId))
            ->latest()
            ->paginate(15);

        return ApiResponse::getResponse(
            VolunteerResource::collection($volunteers),
            Response::HTTP_OK,
        );
    }

    /**
     * GET /admin/opportunities?status=registration_open|...
     */
    public function opportunities(Request $request)
    {
        $query = Opportunity::with(['category', 'skills', 'organization.user', 'governorate']);

        if ($request->filled('status')) {
            $status = OpportunityStatus::tryFrom($request->string('status')->toString());

            if ($status) {
                $query->whereOpportunityStatus($status);
            }
        }

        $opportunities = $query->latest()->paginate(15);

        return ApiResponse::getResponse(
            OpportunityResource::collection($opportunities),
            Response::HTTP_OK,
        );
    }
}
