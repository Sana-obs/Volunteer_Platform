<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AchievementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'date' => $this->date,
            'description' => $this->description,
            'volunteer' => [
                'id' => $this->volunteer->id,
                'first_name' => $this->volunteer->user->first_name,
                'last_name' => $this->volunteer->user->last_name,
            ],
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],
        ];
    }
}