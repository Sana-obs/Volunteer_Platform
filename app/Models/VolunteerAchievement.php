<?php
// app/Models/VolunteerAchievement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VolunteerAchievement extends Model
{
    protected $table = 'volunteer_achievement';

    protected $fillable = ['volunteer_id', 'achievement_id', 'unlocked', 'earned_date'];

    protected $casts = [
        'unlocked'    => 'boolean',
        'earned_date' => 'date',
    ];

    public function volunteer()
    {
        return $this->belongsTo(Volunteer::class, 'volunteer_id');
    }

    public function achievement()
    {
        return $this->belongsTo(Achievement::class, 'achievement_id');
    }
}
