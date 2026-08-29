<?php
// app/Enum/OrganizationStatus.php

namespace App\Enum;

enum OrganizationStatus: string
{
    case Pending   = 'pending';
    case Verified  = 'verified';
    case Rejected  = 'rejected';
    case Suspended = 'suspended';

    public static function toArray(): array
    {
        return array_column(self::cases(), 'value');
    }
}
