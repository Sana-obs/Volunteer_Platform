<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }
}
