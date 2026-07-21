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

        return ApiResponse::getResponse(VolunteerResource::collection($volunteers), 200, 'Volunteers retrieved successfully');
    }

    public function store(VolunteerRequest $request)
    {
        if (Volunteer::where('user_id', $request->user()->id)->exists()) {
            return ApiResponse::getResponse(null, 409, 'Volunteer profile already exists');
        }

        $volunteer = Volunteer::create([
            'user_id' => $request->user()->id,
            'gender' => $request->gender,
            'city' => $request->city,
            'education_level' => $request->education_level,
            'birth_date' => $request->birth_date,
            'photo' => $request->photo,
            'about' => $request->about,
        ]);

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, 'Profile completed successfully');
    }

    public function show(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, 'Volunteer profile not found');
        }

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, 'Volunteer profile retrieved successfully');
    }

    public function update(VolunteerRequest $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, 'Volunteer profile not found');
        }

        $volunteer->update([
            'gender' => $request->gender,
            'city' => $request->city,
            'education_level' => $request->education_level,
            'birth_date' => $request->birth_date,
            'photo' => $request->photo,
            'about' => $request->about,
        ]);

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, 'Volunteer profile updated successfully');
    }

    public function destroy(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, 'Volunteer profile not found');
        }

        $volunteer->delete();

        return ApiResponse::getResponse(null, 200, 'Volunteer profile deleted successfully');
    }
}