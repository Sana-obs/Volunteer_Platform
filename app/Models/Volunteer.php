<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Volunteer extends Model implements HasMedia
{
    use InteractsWithMedia,HasFactory;
    protected $fillable = [
        'user_id',
        'gender',
        'governorate_id',
        'education_level',
        'birth_date',
        'about',

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_photo')
            ->useDisk('public')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function skills()
        {
            return $this->belongsToMany(Skill::class, 'skill_volunteer');
        }

public function participations()
{

    return $this->hasMany(Participation::class, 'volunteer_id', 'user_id');
}
public function governorate()
{
    return $this->belongsTo(Governorate::class);
}

public function achievements()
{
    return $this->belongsToMany(Achievement::class, 'volunteer_achievement')
        ->withPivot(['unlocked', 'earned_date'])
        ->as('volunteerPivot')
        ->withTimestamps();
}

public function volunteerAchievements() // ← جديد
{
    return $this->hasMany(VolunteerAchievement::class, 'volunteer_id');
}
}
