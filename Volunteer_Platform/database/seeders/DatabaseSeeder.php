<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            GovernorateSeeder::class,
            CategorySeeder::class,
            SkillSeeder::class,
            AchievementSeeder::class,
        ]);

        $testUser = User::factory()->create([
            'first_name' => 'Test',
            'last_name'  => 'Admin',
            'email'      => 'admin@volunteer.test',
            'password'=>'Admin@123'
        ]);

        $testUser->assignRole('platform-admin');
    }
}
