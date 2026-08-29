<?php

namespace App\Enum;

enum OpportunityStatus: string
{
    case RegistrationOpen = 'registration_open';
    case RegistrationClosed = 'registration_closed';
    case InProgress = 'in_progress';
    case Completed = 'completed';


    public static function manuallyToggleable(): array
    {
        return [self::RegistrationOpen, self::RegistrationClosed];
    }

    public function label(): string
    {
        return match ($this) {
            self::RegistrationOpen => 'Registration is Open',
            self::RegistrationClosed => 'Registration is Closed',
            self::InProgress => 'Opportunity is In Progress',
            self::Completed => 'Opportunity is Completed',
        };
    }
}
