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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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

    /**
     * Display the specified resource.
     */
    public function show(Volunteer $volunteer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Volunteer $volunteer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Volunteer $volunteer)
    {
        //
    }
}
