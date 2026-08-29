<?php
// app/Http/Resources/ParticipationResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ParticipationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'opportunityId'    => $this->opportunity_id,
            'volunteerId'      => $this->volunteer_id,
            'status'           => $this->status,
            'displayStatus'    => $this->display_status,
            'committedHours'   => $this->committed_hours,
            'hoursLogged'      => $this->hours_logged,
            'rejectionReason'  => $this->rejection_reason,
            'withdrawnDate'    => $this->withdrawn_date,
            'joinedDate'       => $this->participated_at,
            'canWithdraw'      => $this->can_withdraw,
            'opportunity'      => new OpportunityResource($this->whenLoaded('opportunity')),
            'volunteer'        => new UserResource($this->whenLoaded('volunteer')), // أو VolunteerResource عندك
        ];
    }
}
