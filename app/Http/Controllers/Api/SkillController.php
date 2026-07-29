<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\SkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;

class SkillController extends Controller
{
    public function index()
    {
        $skills = Skill::query()->latest()->get();

        return ApiResponse::getResponse(SkillResource::collection($skills), 200);
    }

    public function store(SkillRequest $request)
    {
        $skill = Skill::create($request->validated());

        return ApiResponse::getResponse(new SkillResource($skill), 201, 'Skill created successfully');
    }

    public function show(Skill $skill)
    {
        return ApiResponse::getResponse(new SkillResource($skill), 200);
    }

    public function update(SkillRequest $request, Skill $skill)
    {
        $skill->update($request->validated());

        return ApiResponse::getResponse(new SkillResource($skill), 200, 'Skill updated successfully');
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return ApiResponse::getResponse(null, 200, 'Skill deleted successfully');
    }
}