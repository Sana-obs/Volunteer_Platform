<?php
// app/Enum/ParticipationStatus.php

namespace App\Enum;

enum ParticipationStatus: string
{
    case Pending   = 'pending';
    case Accepted  = 'accepted';
    case Rejected  = 'rejected';
    case Withdrawn = 'withdrawn';

    public static function toArray(): array
    {
        return array_column(self::cases(), 'value');
    }
}
