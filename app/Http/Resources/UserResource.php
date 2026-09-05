<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\VolunteerResource;
use App\Http\Resources\OrganizationResource;

class UserResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'organization_name' => $this->organization_name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'roles' => $this->getRoleNames(),
            'volunteer' => new VolunteerResource($this->whenLoaded('volunteer')),
            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'has_volunteer_profile' => $this->volunteer()->exists(),
            'has_organization_profile' => $this->organization()->exists(),
            'created_at' => $this->created_at,
        ];
    }
}
