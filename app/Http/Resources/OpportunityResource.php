<?php
// app/Http/Resources/OpportunityResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'city' => $this->governorate ? [
                'id'     => $this->governorate->id,
                'nameEn' => $this->governorate->name_en,

                ] : null,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'register_start_at' => $this->register_start_at?->toISOString(),
            'register_end_at' => $this->register_end_at?->toISOString(),

            'min_hours' => $this->min_hours,
            'max_hours' => $this->max_hours,
            'total_hours' => $this->total_hours,

            'current_volunteers' => $this->current_volunteers,
            'max_volunteers' => $this->max_volunteers,
            'min_volunteers' => $this->min_volunteers,
            'registration_closed_manually' => $this->registration_closed_manually,


            'status'        => $this->status->value,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],

            'skills' => $this->skills->map(fn ($skill) => [
                'id' => $skill->id,
                'name' => $skill->name,
            ]),

            'organization' => [
    'id'        => $this->organization->id,
    'name'      => $this->organization->name,
    'image_url' => $this->organization->getFirstMediaUrl('profile_image') ?: null,
    'phone'     => $this->organization->user->phone_number,
],


            'image' => $this->getFirstMediaUrl('opportunity_image') ?: null,
            'is_group'=>$this->is_group,
            'registrationClosedReason' => $this->registration_closed_reason,
            'isSuitable' => $this->when(isset($this->is_suitable), fn () => $this->is_suitable),
            'matchLabel' => $this->when(isset($this->match_label), fn () => $this->match_label),
            'is_successful'  => $this->is_successful,
            'createdAt' => $this->created_at,
        ];
    }
}
