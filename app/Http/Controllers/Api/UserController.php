<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
use App\Helpers\ApiResponse;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;

class UserController extends Controller
{
    public function register(RegisterRequest $request)
    {

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::getResponse([
            'user' => new UserResource ($user),
            'token' => $token,
        ], 201, 'Created successful');
    }
    public function login(LoginRequest $request)
    {

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return ApiResponse::getResponse(null,401,'Invalid login ');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::getResponse([
            'user' =>new UserResource ($user),
            'token' => $token,
        ],200,'Login successful');
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::getResponse(null, 200, 'Logged out successfully');
    }
}
