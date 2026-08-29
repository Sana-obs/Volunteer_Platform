<?php
// app/Http/Controllers/Api/AdminProfileController.php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAdminPasswordRequest;
use App\Http\Requests\UpdateAdminProfileRequest;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class AdminProfileController extends Controller
{
    public function update(UpdateAdminProfileRequest $request)
    {
        $admin = $request->user();
        $admin->update($request->validated());

        return ApiResponse::getResponse(
            $admin->fresh(),
            Response::HTTP_OK,
            'Profile updated successfully'
        );
    }

    public function updatePassword(UpdateAdminPasswordRequest $request)
    {
        $request->user()->update([
            'password' => Hash::make($request->validated('newPassword')),
        ]);

        return ApiResponse::getResponse(null, Response::HTTP_OK, 'Password updated successfully');
    }
}
