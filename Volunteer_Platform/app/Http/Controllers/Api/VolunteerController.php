<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Models\User;
use App\Helpers\ApiResponse;
use App\Http\Requests\VolunteerRequest;
use App\Http\Requests\UpdateVolunteerRequest;
use App\Http\Resources\VolunteerResource;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function index()
{
    $volunteers = Volunteer::query()
        ->with([
            'user',
            'governorate',
            'skills.category',
        ])
        ->withCount([
            'participations as opportunities_joined_count' => function ($query) {
                $query->where('status', 'accepted');
            },
        ])
        ->paginate(15);

    return ApiResponse::getResponse(
        VolunteerResource::collection($volunteers),
        200,
        'Volunteers retrieved successfully'
    );
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
        $volunteer->load([
        'user',
        'governorate',
        'skills.category',
    ]);

    $volunteer->loadCount([
        'participations as opportunities_joined_count' => function ($query) {
        $query->where('status', 'accepted');
    },
]);
        return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, 'Profile completed');
    }

    /**
     * منطق الإنشاء الفعلي — قابل للاستدعاء من store() أو من UserController::register()
     */
    public function createVolunteerProfile(User $user, array $data, Request $request): Volunteer
{
    $data['user_id'] = $user->id;
    $skills = $data['skills'];
    unset($data['skills']);

    $volunteer = Volunteer::create($data);
    $volunteer->skills()->sync($skills);

    if ($request->hasFile('photo')) {
        $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
    }

    return $volunteer;
}

    public function show(Request $request)
{
    $volunteer = Volunteer::query()
        ->where('user_id', $request->user()->id)
        ->with([
            'user',
            'governorate',
            'skills.category',
        ])
        ->withCount([
            'participations as opportunities_joined_count' => function ($query) {
                $query->where('status', 'accepted');
            },
        ])
        ->first();

    if (! $volunteer) {
        return ApiResponse::getResponse(
            null,
            404,
            'Profile not found'
        );
    }

    return ApiResponse::getResponse(
        new VolunteerResource($volunteer),
        200,
        'Profile retrieved successfully'
    );
}

    public function update(UpdateVolunteerRequest $request)
{
    $volunteer = $request->user()->volunteer;

    if (! $volunteer) {
        return ApiResponse::getResponse(null, 404, ' profile not found');
    }

    $data = $request->validated();
    $skills = $data['skills'] ?? null;
    unset($data['skills'], $data['photo'], $data['photo_remove']);

    $volunteer->update($data);

    if ($skills !== null) {
        $volunteer->skills()->sync($skills);
    }

    if ($request->hasFile('photo')) {
        $volunteer->clearMediaCollection('profile_photo');
        $volunteer->addMediaFromRequest('photo')->toMediaCollection('profile_photo');
    } elseif ($request->boolean('photo_remove')) {
        $volunteer->clearMediaCollection('profile_photo');
    }
    $volunteer = $this->loadVolunteerData($volunteer);

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

$volunteer = $this->loadVolunteerData($volunteer);

return ApiResponse::getResponse(
    new VolunteerResource($volunteer),
    200,
    'Skills updated successfully'
);

}
private function loadVolunteerData(Volunteer $volunteer): Volunteer
{
    return $volunteer
        ->load([
            'user',
            'governorate',
            'skills.category',
        ])
        ->loadCount([
            'participations as opportunities_joined_count' => function ($query) {
                $query->where('status', 'accepted');
            },
        ]);
}
}
