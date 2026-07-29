<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Volunteer extends Model implements HasMedia
{
    use InteractsWithMedia, HasFactory;

    protected $fillable = [
        'user_id',
        'gendre',
        'city',
        'education_level',
        'birth_date',
        'about',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'skill_volunteer');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_photo')
            ->useDisk('public')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }
}