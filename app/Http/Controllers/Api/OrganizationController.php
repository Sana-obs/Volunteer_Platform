<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the organizations.
     */
    public function index()
    {
        $organizations = Organization::with('user')->latest()->paginate(15);
        return ApiResponse::getResponse(
            OrganizationResource::collection($organizations),
            Response::HTTP_OK,
        );
    }

    /**
     * Store a newly created organization.
     */
    public function store(OrganizationRequest $request)
    {
        if (Organization::where('user_id', $request->user()->id)->exists()) {
            return ApiResponse::getResponse(null, 409, ' profile already exists');
        }
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $organization = Organization::create($data);

        if ($request->hasFile('verification_documents')) {
            $organization->addMediaFromRequest('verification_documents')
                ->toMediaCollection('verification_documents');
        }
        if ($request->hasFile('photo')) {
            $organization->addMediaFromRequest('photo')->toMediaCollection('profile_image');
        }

        return ApiResponse::getResponse(
            new OrganizationResource($organization),
            Response::HTTP_CREATED,
            'Organization created successfully'
        );
    }

    /**
     * Display the specified organization.
     */
    public function show(Organization $organization)
    {
        return ApiResponse::getResponse(
            new OrganizationResource($organization->load('user')),
            Response::HTTP_OK,
        );
    }

    /**
     * Update the specified organization.
     */
    public function update(OrganizationRequest $request, Organization $organization)
    {
        $organization->update($request->validated());

        return ApiResponse::getResponse(
            new OrganizationResource($organization),
            Response::HTTP_OK,
            'Organization updated successfully'
        );
    }

    /**
     * Remove the specified organization.
     */
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
