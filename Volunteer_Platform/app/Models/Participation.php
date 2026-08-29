<?php
// app/Models/Participation.php

namespace App\Models;

use App\Enum\ParticipationStatus;
use Illuminate\Database\Eloquent\Model;
use App\Enum\OpportunityStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Participation extends Model
{
    protected $table = 'opportunity_volunteer';

    protected $fillable = [
        'opportunity_id',
        'volunteer_id',
        'status',
        'committed_hours',
        'hours_logged',
        'rejection_reason',
        'withdrawn_date',
        'participated_at',
    ];

    protected $casts = [
        'status'           => ParticipationStatus::class,
        'withdrawn_date'   => 'date',
        'participated_at'  => 'datetime',
        'committed_hours'  => 'integer',
        'hours_logged'     => 'integer',
    ];

    protected $appends = ['display_status', 'can_withdraw'];

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function volunteer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'volunteer_id');
    }

    /**
     * §8.2 — computed-only, never stored
     */
    public function getDisplayStatusAttribute(): string
{
    if ($this->status === ParticipationStatus::Pending && Carbon::now()->gte($this->opportunity->start_date)) {
        return 'expired';
    }

    if ($this->status === ParticipationStatus::Accepted) {
        return match ($this->opportunity->status) {
            OpportunityStatus::InProgress => 'active',
            OpportunityStatus::Completed  => 'completed',
            default                       => ParticipationStatus::Accepted->value,
        };
    }

    return $this->status->value;
}

    /**
     * §8.3 — مربوط بحالة تسجيل الفرصة، مش بتاريخ البدء
     */
    public function getCanWithdrawAttribute(): bool
{
    if (!in_array($this->status, [ParticipationStatus::Pending, ParticipationStatus::Accepted], true)) {
        return false;
    }

    return $this->opportunity->status === OpportunityStatus::RegistrationOpen;
}
}
