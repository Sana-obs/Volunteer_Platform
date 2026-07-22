<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Helpers\ApiResponse;
use App\Http\Requests\AchievementRequest;
use App\Http\Resources\AchievementResource;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index()
    {
        $achievements = Achievement::with(['volunteer', 'category'])->paginate(10);

        return ApiResponse::getResponse(AchievementResource::collection($achievements), 200, 'Achievements retrieved successfully');
    }

    public function store(AchievementRequest $request)
    {
        $volunteer = $request->user()->volunteer;

        if (! $volunteer) {
            return ApiResponse::getResponse(null, 404, ' profile not found');
        }

        $data = $request->validated();
        $data['volunteer_id'] = $volunteer->id;

        $achievement = Achievement::create($data);

        return ApiResponse::getResponse(new AchievementResource($achievement), 201, 'Achievement added');
    }

    public function show(Request $request, $id)
    {
        $achievement = Achievement::with(['volunteer', 'category'])->find($id);

        if (! $achievement) {
            return ApiResponse::getResponse(null, 404, 'Achievement not found');
        }

        return ApiResponse::getResponse(new AchievementResource($achievement), 200, 'Achievement retrieved ');
    }

    public function update(AchievementRequest $request, $id)
    {
        $achievement = Achievement::find($id);

        if (! $achievement) {
            return ApiResponse::getResponse(null, 404, 'Achievement not found');
        }

        if ($achievement->volunteer_id !== $request->user()->volunteer->id) {
            return ApiResponse::getResponse(null, 403, 'You are not authorized to update this achievement');
        }

        $achievement->update($request->validated());

        return ApiResponse::getResponse(new AchievementResource($achievement), 200, 'Achievement updated ');
    }

    public function destroy(Request $request, $id)
    {
        $achievement = Achievement::find($id);

        if (! $achievement) {
            return ApiResponse::getResponse(null, 404, 'Achievement not found');
        }

        if ($achievement->volunteer_id !== $request->user()->volunteer->id) {
            return ApiResponse::getResponse(null, 403, 'You are not authorized to delete this achievement');
        }

        $achievement->delete();

        return ApiResponse::getResponse(null, 200, 'Achievement deleted ');
    }
}