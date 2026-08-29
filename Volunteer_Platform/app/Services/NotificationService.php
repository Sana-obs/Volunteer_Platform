<?php

namespace App\Services;

use App\Enum\NotificationType;
use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public static function notify(
        User $user,
        NotificationType $type,
        string $title,
        ?string $description = null,
        ?string $href = null
    ): Notification {
        return Notification::create([
            'user_id'     => $user->id,
            'type'        => $type,
            'title'       => $title,
            'description' => $description,
            'href'        => $href,
            'seen'        => false,
        ]);
    }

    public static function notifyAdmins(
        NotificationType $type,
        string $title,
        ?string $description = null,
        ?string $href = null
    ): void {
        User::role('platform-admin')->get()->each(
            fn (User $admin) => self::notify($admin, $type, $title, $description, $href)
        );
    }
}
