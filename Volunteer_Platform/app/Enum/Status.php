<?php
// app/Enums/Participation/Status.php

namespace App\Enum;

enum Status: string
{
    case Pending   = 'pending';
    case Accepted  = 'accepted';
    case Rejected  = 'rejected';
    case Withdrawn = 'withdrawn';
    case Expired = 'expired';
    case Suspended = 'suspended';
    case Verified = 'verified';

    public static function toArray(): array
    {
        return array_column(self::cases(), 'value');
    }
}
