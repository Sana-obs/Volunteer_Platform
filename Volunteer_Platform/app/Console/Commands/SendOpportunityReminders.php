<?php
// app/Console/Commands/SendOpportunityReminders.php

namespace App\Console\Commands;

use App\Enum\NotificationType;
use App\Models\Opportunity;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendOpportunityReminders extends Command
{
    protected $signature = 'notifications:opportunity-reminders';
    protected $description = 'Notify accepted volunteers 2 days before their opportunity starts';

    public function handle(): void
    {
        $opportunities = Opportunity::whereBetween('start_date', [
                now()->addDays(2)->startOfDay(),
                now()->addDays(2)->endOfDay(),
            ])
            ->whereNull('reminder_sent_at')
            ->with(['participations' => fn ($q) => $q->where('status', 'accepted')->with('volunteer')])
            ->get();

        foreach ($opportunities as $opportunity) {
            foreach ($opportunity->participations as $participation) {
                NotificationService::notify(
                    $participation->volunteer,
                    NotificationType::OpportunityReminder,
                    'Upcoming opportunity',
                    "\"{$opportunity->title}\" starts in 2 days.",
                    '/my-volunteering'
                );
            }

            $opportunity->update(['reminder_sent_at' => now()]);
        }

        $this->info("Sent reminders for {$opportunities->count()} opportunities.");
    }
}
