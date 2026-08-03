<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Helpers\ApiResponse;
use App\Http\Requests\VolunteerRequest;
use App\Http\Resources\VolunteerResource;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function index()
    {
        $volunteers = Volunteer::all();

        return ApiResponse::getResponse(VolunteerResource::collection($volunteers), 200, ' retrieved successfully');
    }

    public function store(VolunteerRequest $request)
    {
        if (Volunteer::where('user_id', $request->user()->id)->exists()) {
            return ApiResponse::getResponse(null, 409, ' profile already exists');
        }

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $skills = $data['skills'];
        unset($data['skills']);

        $volunteer = Volunteer::create($data);

        $volunteer->skills()->attach($skills);

        if ($request->hasFile('photo')) {
            $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
        }

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, 'Profile completed');
    }

    public function show(Volunteer $volunteer)
    {
        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, ' profile retrieved ');
    }

    public function update(VolunteerRequest $request, Volunteer $volunteer)
    {
        if ($volunteer->user_id !== $request->user()->id) {
            return ApiResponse::getResponse(null, 403, 'You are not authorized to update this profile');
        }

        $data = $request->validated();

        $skills = $data['skills'];
        unset($data['skills']);

        $volunteer->update($data);

        $volunteer->skills()->sync($skills);

        if ($request->hasFile('photo')) {
            $volunteer->clearMediaCollection('profile_photo');
            $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
        }

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, ' profile updated ');
    }

    public function destroy(Request $request, Volunteer $volunteer)
    {
        if ($volunteer->user_id !== $request->user()->id) {
            return ApiResponse::getResponse(null, 403, 'You are not authorized to delete this profile');
        }

        $volunteer->clearMediaCollection('profile_photo');
        $volunteer->delete();

        return ApiResponse::getResponse(null, 200, ' profile deleted');
    }
}