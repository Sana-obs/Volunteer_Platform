<?php


namespace App\Policies;

use App\Models\Opportunity;
use App\Models\User;


class OpportunityPolicy
{
    /**
     * Section 3.4: a pending or rejected organization can't publish
     * opportunities — status must actually be verified, not just the account type.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('organization')
            && $user->organization?->status === 'verified';
    }

    /**
     * Section 2: actually verify the opportunity belongs to this exact
     * organization, not just that the account type is "organization".
     */
    public function update(User $user, Opportunity $opportunity): bool
    {
        return $user->hasRole('organization')
            && $user->organization?->id === $opportunity->organization_id;
    }

    public function delete(User $user, Opportunity $opportunity): bool
    {
        return $this->update($user, $opportunity);
    }
}
