<?php
// app/Enum/NotificationType.php

namespace App\Enum;

enum NotificationType: string
{
    case Achievement          = 'achievement';
    case Hours                = 'hours';
    case StatusAccepted       = 'status-accepted';
    case StatusRejected       = 'status-rejected';
    case OpportunityReminder  = 'opportunity-reminder';
    case OrgVerified          = 'org-verified';
    case OrgRejected          = 'org-rejected';
    case ApplicantWithdrawn   = 'applicant-withdrawn';
    case ApplicantNew         = 'applicant-new';
    case PendingOrganization = 'org-pending';
}
