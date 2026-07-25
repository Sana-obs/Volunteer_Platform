<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AchievementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pivot = $this->volunteerPivot;

        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'name'        => $this->name,
            'description' => $this->description,
            'unlocked'    => $pivot?->unlocked ?? false,
            'earnedDate'  => $pivot?->earned_date ? \Carbon\Carbon::parse($pivot->earned_date)->format('Y-m-d') : null,
        ];
    }
}