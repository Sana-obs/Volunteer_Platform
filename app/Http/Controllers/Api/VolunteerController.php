<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Models\User;
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

        $volunteer = $this->createVolunteerProfile(
            $request->user(),
            $request->validated(),
            $request
        );
        if (! $request->user()->hasRole('volunteer')) {
            $request->user()->assignRole('volunteer');
        }
        return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, 'Profile completed');
    }

    /**
     * منطق الإنشاء الفعلي — قابل للاستدعاء من store() أو من UserController::register()
     */
    public function createVolunteerProfile(User $user, array $data, Request $request): Volunteer
    {
        $data['user_id'] = $user->id;

        $volunteer = Volunteer::create($data);

        if ($request->hasFile('photo')) {
            $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
        }

        return $volunteer;
    }

    public function show(Request $request)
    {
        $volunteer = $request->user()->volunteer()->with('skills')->first();

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

        if ($request->hasFile('photo')) {
            $volunteer->clearMediaCollection('profile_photo');
            $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
        }

        return ApiResponse::getResponse(new VolunteerResource($volunteer), 200, ' profile updated ');
    }

    public function destroy(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        $volunteer->clearMediaCollection('profile_photo');
        $volunteer->delete();

        return ApiResponse::getResponse(null, 200, ' profile deleted');
    }
    public function syncSkills(Request $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        $validated = $request->validate([
            'skill_ids'   => ['required', 'array'],
            'skill_ids.*' => ['exists:skills,id'],
        ]);

        $volunteer->skills()->sync($validated['skill_ids']);

        return ApiResponse::getResponse(
            new VolunteerResource($volunteer->load('skills')),
            200,
            'Skills updated successfully'
        );
    }
}
