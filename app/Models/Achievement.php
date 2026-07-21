<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'volunteer_id',
        'category_id',
        'name',
        'date',
        'description',
    ];

    public function volunteer()
    {
        return $this->belongsTo(Volunteer::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}