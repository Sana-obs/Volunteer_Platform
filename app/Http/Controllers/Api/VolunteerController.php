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

        $volunteer = Volunteer::create($data);

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, 'Profile completed');
    }

    public function show(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, ' profile retrieved ');
    }

    public function update(VolunteerRequest $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        $volunteer->update($request->validated());

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, ' profile updated ');
    }

    public function destroy(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        $volunteer->delete();

        return ApiResponse::getResponse(null, 200, ' profile deleted');
    }
}