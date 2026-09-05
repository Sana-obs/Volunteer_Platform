<?php

namespace App\Models;

use App\Enum\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = ['user_id', 'type', 'title', 'description', 'href', 'seen'];

    protected $casts = [
        'type' => NotificationType::class,
        'seen' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
