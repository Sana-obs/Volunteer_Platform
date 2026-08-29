<?php
// app/Http/Controllers/Api/OpportunityController.php

namespace App\Http\Controllers\Api;

use App\Enum\OpportunityStatus;
use App\Enum\OrganizationStatus;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\OpportunityRequest;
use App\Http\Requests\UpdateOpportunityRequest;
use App\Http\Requests\UpdateOpportunityStatusRequest;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use App\Services\NaiveBayesService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OpportunityController extends Controller
{
    /**
     * GET /opportunities?search=&categoryId=&skillId=&location=&status=
     */
    public function index(Request $request)
    {
        $query = Opportunity::with(['category', 'skills', 'organization.user', 'governorate']);

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->string('search')}%");
        }

        if ($request->filled('categoryId')) {
        $query->where('category_id', $request->integer('categoryId'));
        } elseif ($request->filled('categoryIds')) {
    $query->whereIn('category_id', (array) $request->input('categoryIds'));
        }

if ($request->filled('skillId')) {
    $skillId = $request->integer('skillId');
    $query->whereHas('skills', fn ($q) => $q->where('skills.id', $skillId));
} elseif ($request->filled('skillIds')) {
    $skillIds = (array) $request->input('skillIds');
    $query->whereHas('skills', fn ($q) => $q->whereIn('skills.id', $skillIds));
}

        if ($request->filled('location')) {
            $query->whereHas('governorate', fn ($q) =>
            $q->where('name_en', 'like', "%{$request->string('location')}%")
        );
}

        if ($request->filled('status')) {
            $status = OpportunityStatus::tryFrom((string) $request->string('status'));
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

    /**
     * GET /opportunities/{id}
     */
    public function show(Opportunity $opportunity)
    {
        $opportunity->load(['category', 'skills', 'organization.user', 'governorate']);

        return ApiResponse::getResponse(
            new OpportunityResource($opportunity),
            Response::HTTP_OK,
        );
    }

    /**
     * POST /opportunities — verified organizations only (status === verified, section 3.4)
     */
    public function store(OpportunityRequest $request)
    {
        $organization = $request->user()->organization;

        if (! $organization || $organization->status !==OrganizationStatus::Verified) {
            return ApiResponse::getResponse(
                null,
                Response::HTTP_FORBIDDEN,
                'The organization must be verified to publish opportunities.'
            );
        }

        $opportunity = DB::transaction(function () use ($request, $organization) {
            $opportunity = Opportunity::create([
                ...$request->safe()->except(['skills', 'image']),
                'organization_id' => $organization->id,
            ]);

            $opportunity->skills()->sync($request->validated('skills'));

            if ($request->hasFile('image')) {
                $opportunity->addMediaFromRequest('image')->toMediaCollection('opportunity_image');
            }

            return $opportunity;
        });

        $opportunity->load(['category', 'skills', 'organization.user', 'governorate']);

        return ApiResponse::getResponse(
            new OpportunityResource($opportunity),
            Response::HTTP_CREATED,
            'Opportunity created successfully'
        );
    }

    /**
     * POST /opportunities/{id} + _method=PUT — owning organization only
     * (actually checks it belongs to this organization, not just the account type — section 2)
     */
    public function update(UpdateOpportunityRequest $request, Opportunity $opportunity)
    {
        if ($opportunity->organization_id !== $request->user()->organization?->id) {
            return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'You are not authorized to update this opportunity.');
        }
        if ($request->user()->organization->status !==OrganizationStatus::Verified) {
            return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'Your organization must be verified to edit opportunities.');
        }

        DB::transaction(function () use ($request, $opportunity) {
            $opportunity->update($request->safe()->except(['skills', 'image']));

            if ($request->has('skills')) {
                $opportunity->skills()->sync($request->validated('skills'));
            }

            if ($request->hasFile('image')) {
                $opportunity->clearMediaCollection('opportunity_image');
                $opportunity->addMediaFromRequest('image')->toMediaCollection('opportunity_image');
            }
        });

        $opportunity->load(['category', 'skills', 'organization.user', 'governorate']);

        return ApiResponse::getResponse(
            new OpportunityResource($opportunity),
            Response::HTTP_OK,
            'Opportunity updated successfully'
        );
    }

    /**
     * DELETE /opportunities/{id} — owning organization only
     */
    public function destroy(Request $request, Opportunity $opportunity)
    {
        if ($opportunity->organization_id !== $request->user()->organization?->id) {
            return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'You are not authorized to delete this opportunity.');
        }
        if ($request->user()->organization->status !==OrganizationStatus::Verified) {
            return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'Your organization must be verified to edit opportunities.');
        }
        $opportunity->delete();

        return ApiResponse::getResponse(null, Response::HTTP_OK, 'Opportunity deleted successfully');
    }


    public function updateStatus(UpdateOpportunityStatusRequest $request, Opportunity $opportunity)
{
    if ($opportunity->organization_id !== $request->user()->organization?->id) {
        return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'You are not authorized to update this opportunity\'s status.');
    }

    // §21.13 — enforcement فعلي مو بس UI
    if ($request->user()->organization->status !==OrganizationStatus::Verified) {
        return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'Your organization must be verified to manage this opportunity.');
    }

    if (in_array($opportunity->status, [OpportunityStatus::InProgress, OpportunityStatus::Completed], true)) {
        return ApiResponse::getResponse(null, Response::HTTP_CONFLICT, 'Cannot update the status of an opportunity that is in progress or completed.');
    }

    $closing = $request->validated('status') === 'registration_closed';

    $opportunity->update([
        'registration_closed_manually' => $closing,
        // بترجع تنفتح تلقائياً لما المنظمة تفتحها يدوياً، بغض النظر شو كان السبب قبلها (§3.4)
        'registration_closed_reason'   => $closing ? 'organization' : null,
    ]);

    $opportunity->load(['category', 'skills', 'organization.user', 'governorate']);

    return ApiResponse::getResponse(
        new OpportunityResource($opportunity),
        Response::HTTP_OK,
        'Opportunity status updated successfully'
    );
}
public function suggestedForMe(Request $request)
{
    $volunteer = $request->user()->volunteer;

    if (! $volunteer) {
        return ApiResponse::getResponse(null, Response::HTTP_UNPROCESSABLE_ENTITY, 'Only volunteers can view suggested opportunities.');
    }

    $nb = new NaiveBayesService();

    try {
        $nb->loadModel(storage_path('app/models/volunteer_matching_model.json'));
    } catch (\RuntimeException $e) {
        return ApiResponse::getResponse(null, Response::HTTP_SERVICE_UNAVAILABLE, 'Suggested opportunities are temporarily unavailable.');
    }

    $opportunities = Opportunity::with(['category', 'skills', 'organization.user', 'governorate'])
        ->whereOpportunityStatus(OpportunityStatus::RegistrationOpen)
        ->get();

    $volunteer->loadMissing(['skills', 'governorate']);

    $volunteerData = [
        'city'   => $volunteer->governorate?->name_en,
        'skills' => $volunteer->skills->pluck('name')->toArray(),
    ];

    $classified = $opportunities->map(function ($opportunity) use ($nb, $volunteerData) {
        $result = $nb->predictMatch($volunteerData, [
            'city'            => $opportunity->governorate?->name_en,
            'required_skills' => $opportunity->skills->pluck('name')->toArray(),
        ]);

        $opportunity->is_suitable = $result['label'] === 'suitable';
        $opportunity->match_label = $result['label'];

        return $opportunity;
    })->sortByDesc('is_suitable')->values();

    return ApiResponse::getResponse(
        OpportunityResource::collection($classified),
        Response::HTTP_OK,
        'Suggested opportunities retrieved successfully'
    );
}
}
