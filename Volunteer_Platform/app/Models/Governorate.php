<?php
// app/Models/Governorate.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Governorate extends Model
{
    protected $fillable = ['name_en', 'name_ar', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
    public function organizations()
{
    return $this->hasMany(Organization::class);
}

public function opportunities()
{
    return $this->hasMany(Opportunity::class);
}

public function volunteers()
{
    return $this->hasMany(Volunteer::class);
}
    protected static function booted(): void
    {
        static::creating(function (Governorate $governorate) {
            $governorate->slug ??= Str::slug($governorate->name_en);
        });
    }
}
