<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opportunity extends Model
{
    protected $fillable = [
        'title',
        'isGroup',
        // أضيفي باقي الأعمدة الخاطفة بالموديل هنا عند الحاجة
    ];
}
