<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Helpers\ApiResponse;
use App\Http\Requests\VolunteerRequest;
use App\Http\Resources\VolunteerResource;

class VolunteerController extends Controller
{
    public function store(VolunteerRequest $request)
    {
        $volunteer = Volunteer::create([
            'user_id' => $request->user()->id,
            'gender' => $request->gender,
            'city' => $request->city,
            'education_level' => $request->education_level,
            'birth_date' => $request->birth_date,
            'photo' => $request->photo,
            'about' => $request->about,
        ]);

       return ApiResponse::getResponse(new VolunteerResource($volunteer), 201, ' profile completed successfully');
    }
} 