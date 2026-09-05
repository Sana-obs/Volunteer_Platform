<?php


namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'code'        => 'a1',
                'name'        => 'First Volunteering Opportunity',
                'description' => 'Completed your first volunteering opportunity.',
            ],
            [
                'code'        => 'a2',
                'name'        => '10 Volunteer Hours',
                'description' => 'Reached 10 cumulative volunteering hours.',
            ],
            [
                'code'        => 'a3',
                'name'        => 'Completion of Three Group Activities',
                'description' => 'Completed 3 group volunteering opportunities.',
            ],
        ];

        foreach ($achievements as $data) {
            Achievement::updateOrCreate(['code' => $data['code']], $data);
        }
    }
}
