<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
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
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization)
    public function update(OrganizationRequest $request, Organization $organization)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization)
    {
        //
    }
}
