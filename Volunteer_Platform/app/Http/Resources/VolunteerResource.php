<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VolunteerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gendre' => $this->gendre,
            'city' => $this->city,
            'education_level' => $this->education_level,
            'birth_date' => $this->birth_date,
            'about' => $this->about,
            'user' => [
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'email' => $this->user->email,
                'phone_number' => $this->user->phone_number,
            ],
            'photo' => $this->getFirstMedia('profile_photo') ?: null,
        ];
    }
}
