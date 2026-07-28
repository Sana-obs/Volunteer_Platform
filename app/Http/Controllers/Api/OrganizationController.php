<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrganizationController extends Controller
{
    public function index()
    {
        $organizations = Organization::with('user')->latest()->paginate(15);
        return ApiResponse::getResponse(
            OrganizationResource::collection($organizations),
            Response::HTTP_OK,
        );
    }
    public function store(OrganizationRequest $request)
{
    if (Organization::where('user_id', $request->user()->id)->exists()) {
        return ApiResponse::getResponse(null, 409, 'profile already exists');
    }

    $organization = $this->createOrganizationProfile(
        $request->user(),
        $request->validated(),
        $request
    );

    if (! $request->user()->hasRole('organization')) {
        $request->user()->assignRole('organization');
    }

    return ApiResponse::getResponse(
        new OrganizationResource($organization),
        Response::HTTP_CREATED,
        'Organization created successfully'
    );
}

    /**
     * منطق الإنشاء الفعلي — قابل للاستدعاء من store() أو من UserController::register()
     */
    public function createOrganizationProfile(User $user, array $data, Request $request): Organization
    {
        $data['user_id'] = $user->id;
        $data['status'] = $data['status'] ?? 'pending';

        $organization = Organization::create($data);

        if ($request->hasFile('verification_document')) {
            $organization->addMediaFromRequest('verification_document')
                ->toMediaCollection('verification_documents');
        }

        if ($request->hasFile('photo')) {
            $organization->addMediaFromRequest('photo')->toMediaCollection('profile_image');
        }

        return $organization;
    }

    public function show(Organization $organization)
    {
        return ApiResponse::getResponse(
            new OrganizationResource($organization->load('user')),
            Response::HTTP_OK,
        );
    }

    public function update(OrganizationRequest $request, Organization $organization)
    {
        $organization->update($request->validated());

        return ApiResponse::getResponse(
            new OrganizationResource($organization),
            Response::HTTP_OK,
            'Organization updated successfully'
        );
    }

    public function destroy(Organization $organization)
    {
        $organization->delete();

        return ApiResponse::getResponse(
            null,
            Response::HTTP_OK,
            'Organization deleted successfully'
        );
    }
}
