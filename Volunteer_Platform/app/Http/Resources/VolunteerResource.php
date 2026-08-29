<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VolunteerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'gender' => $this->gender,

            'city' => $this->whenLoaded('governorate', function () {
                return $this->governorate ? [
                    'id' => $this->governorate->id,
                    'nameEn' => $this->governorate->name_en,
                    
                ] : null;
            }),

            'education_level' => $this->education_level,

            'birth_date' => $this->birth_date,

            'about' => $this->about,

            'user' => $this->whenLoaded('user', function () {
                return [
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'email' => $this->user->email,
                    'phone_number' => $this->user->phone_number,
                ];
            }),

            'photo' => $this->getFirstMediaUrl('profile_photo') ?: null,

            'skills' => $this->whenLoaded('skills', function () {
                return $this->skills
                    ->pluck('name')
                    ->values();
            }),

            'interests' => $this->whenLoaded('skills', function () {
                return $this->skills
                    ->pluck('category')
                    ->filter()
                    ->unique('id')
                    ->values()
                    ->map(fn ($category) => [
                        'id' => $category->id,
                        'name' => $category->name,
                    ])
                    ->values();
            }),

            'createdAt' => $this->created_at,

            'opportunitiesJoinedCount' => isset($this->opportunities_joined_count)
                ? (int) $this->opportunities_joined_count
                : 0,
        ];
    }
}
