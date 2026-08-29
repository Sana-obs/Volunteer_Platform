<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'city' => $this->governorate ? [
                'id'     => $this->governorate->id,
                'nameEn' => $this->governorate->name_en,
            ] : null,            'contact_person' => $this->contact_person,
            'website' => $this->website,
            'owner' => [
                'id'    => $this->user->id,
                'name'  => $this->user->organization_name
                        ?: trim("{$this->user->first_name} {$this->user->last_name}"),
                'email' => $this->user->email,
],
            'profile_image' => $this->getFirstMediaUrl('profile_image') ?: null,
            'verification_document' => $this->getFirstMediaUrl('verification_documents') ? :null,
            'status' => $this->status,
            'phone'          => $this->user->phone_number,
            'rejectionReason' => $this->rejection_reason,
            'reviewedAt'      => $this->reviewed_at,
            'requestedAt' => $this->created_at,
            ];
    }
}
