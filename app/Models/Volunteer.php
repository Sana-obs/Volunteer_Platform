<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Volunteer extends Model
{
    // app/Models/Volunteer.php
public function volunteerAchievements()
{
    return $this->hasMany(VolunteerAchievement::class, 'volunteer_id');
}

    protected $fillable = [
        'name',
        'user_id',
        // أضيفي باقي الحقول المسموحة هنا (مثل phone, address...)
    ];
}

