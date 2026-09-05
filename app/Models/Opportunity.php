<?php
// app/Models/Opportunity.php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enum\OpportunityStatus;

class Opportunity extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'organization_id', 'category_id', 'governorate_id', 'title', 'description',
        'start_date', 'end_date', 'register_start_at', 'register_end_at',
        'min_hours', 'max_hours', 'total_hours',
        'min_volunteers', 'max_volunteers',
        'registration_closed_manually', 'registration_closed_reason', 'is_group',
    ];

    protected $casts = [
        'start_date'                   => 'datetime',
        'end_date'                     => 'datetime',
        'register_start_at'            => 'datetime',
        'register_end_at'              => 'datetime',
        'registration_closed_manually' => 'boolean',
        'is_group'                     => 'boolean',
    ];

    protected $appends = ['status', 'current_volunteers', 'is_successful'];

    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'opportunity_skill');
    }

    public function getCurrentVolunteersAttribute(): int
    {
        return $this->participations()->where('status', 'accepted')->count();
    }

    protected function status(): Attribute
    {
        return Attribute::make(
            get: function () {
                $now = now();

                if ($now->greaterThanOrEqualTo($this->end_date)) {
                    return OpportunityStatus::Completed;
                }

                if ($now->greaterThanOrEqualTo($this->start_date)) {
                    return OpportunityStatus::InProgress;
                }

                $isFull = $this->current_volunteers >= $this->max_volunteers;
                $registrationEnded = $this->register_end_at
                    && $now->greaterThanOrEqualTo($this->register_end_at);

                if ($this->registration_closed_manually || $isFull || $registrationEnded) {
                    return OpportunityStatus::RegistrationClosed;
                }

                return OpportunityStatus::RegistrationOpen;
            }
        );
    }

    public function getIsSuccessfulAttribute(): bool
    {
        return $this->status === OpportunityStatus::Completed
            && $this->current_volunteers >= $this->min_volunteers;
    }

    public function scopeWhereOpportunityStatus(Builder $query, OpportunityStatus $status): Builder
    {
        $now = now();

        $acceptedCountSubquery = 'select count(*) from opportunity_volunteer
            where opportunity_volunteer.opportunity_id = opportunities.id
            and opportunity_volunteer.status = \'accepted\'';

        return match ($status) {
            OpportunityStatus::Completed => $query->where('end_date', '<=', $now),

            OpportunityStatus::InProgress => $query
                ->where('start_date', '<=', $now)
                ->where('end_date', '>', $now),

            OpportunityStatus::RegistrationClosed => $query
                ->where('start_date', '>', $now)
                ->where(function (Builder $q) use ($now, $acceptedCountSubquery) {
                    $q->where('registration_closed_manually', true)
                        ->orWhereRaw("({$acceptedCountSubquery}) >= max_volunteers")
                        ->orWhere(function (Builder $qq) use ($now) {
                            $qq->whereNotNull('register_end_at')
                                ->where('register_end_at', '<=', $now);
                        });
                }),

            OpportunityStatus::RegistrationOpen => $query
                ->where('start_date', '>', $now)
                ->where('registration_closed_manually', false)
                ->whereRaw("({$acceptedCountSubquery}) < max_volunteers")
                ->where(function (Builder $q) use ($now) {
                    $q->whereNull('register_end_at')
                        ->orWhere('register_end_at', '>', $now);
                }),
        };
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('opportunity_image')->singleFile();
    }
}
