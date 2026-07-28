<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\UserResource;
use App\Helpers\ApiResponse;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\OrganizationController;

class UserController extends Controller
{
    public function register(RegisterRequest $request)
{
    $user = DB::transaction(function () use ($request) {

        $user = User::create([
            'first_name' => $request->account_type === 'volunteer' ? $request->first_name : null,
            'last_name' => $request->account_type === 'volunteer' ? $request->last_name : null,
            'organization_name' => $request->account_type === 'organization' ? $request->organization_name : null,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
        ]);
        $user->load(['volunteer', 'organization']);
        $user->assignRole($request->account_type);

        if ($request->account_type === 'volunteer') {
            app(VolunteerController::class)->createVolunteerProfile($user, [], $request);
        }

        if ($request->account_type === 'organization') {
            $data = [
                'name' => $request->organization_name,
                'contact_person' => $request->contact_person,
            ];
            app(OrganizationController::class)->createOrganizationProfile($user, $data, $request);
        }

        return $user;
    });

    $token = $user->createToken('auth_token')->plainTextToken;

    $message = $user->hasRole('organization')
        ? 'Your request is under review. We will notify you once approved.'
        : 'Account created successfully';

    return ApiResponse::getResponse([
        'user' => new UserResource($user),
        'token' => $token,
    ], 201, $message);
}

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return ApiResponse::getResponse(null, 401, 'Invalid login ');
        }
        $user->load(['volunteer', 'organization']);
        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::getResponse([
            'user' => new UserResource($user),
            'token' => $token,
        ], 200, 'Login successful');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::getResponse(null, 200, 'Logged out ');
    }
}
