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
            // بيعتمد على الأربعة اللي فوقه (محافظات/تصنيفات/مهارات/أدوار).
            // حجمه صغير افتراضيًا وقابل للتحكم عبر DEMO_SEED_SIZE بـ.env
            // (راجعي التعليق بأعلى DemoDataSeeder).
            DemoDataSeeder::class,
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
