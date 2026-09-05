<?php
// app/Models/Organization.php

namespace App\Models;

use App\Enum\OrganizationStatus;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Organization extends Model implements HasMedia
{
    use InteractsWithMedia;

    // Organization.php
protected $fillable = [
    'name', 'governorate_id', 'description', 'contact_person', 'website',
    'user_id', 'status', 'rejection_reason', 'reviewed_at',
];



    protected $casts = [
        'status'      => OrganizationStatus::class,
        'reviewed_at' => 'datetime',
    ];

    public function governorate()
    {
        return $this->belongsTo(Governorate::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function opportunity()
    {
        return $this->hasMany(Opportunity::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('verification_documents')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'application/pdf']);
    }
}
