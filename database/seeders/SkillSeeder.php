<?php
// database/seeders/SkillSeeder.php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skillsByCategory = [
            'Education'   => ['Teaching', 'Tutoring', 'Curriculum Design'],
            'Health'      => ['First Aid', 'Psychological Support', 'Health Awareness'],
            'Environment' => ['Tree Planting', 'Waste Sorting', 'Environmental Education'],
            'Social'      => ['Elderly Care', 'Community Outreach', 'Event Organization'],
            'Technical'   => ['Web Development', 'Data Entry', 'Graphic Design'],
            'Sports'      => ['Sports Coaching', 'Fitness Training'],
        ];

        foreach ($skillsByCategory as $categoryName => $skills) {
            $category = Category::where('name', $categoryName)->first();

            if (! $category) {
                continue;
            }

            foreach ($skills as $skillName) {
                Skill::firstOrCreate(
                    ['name' => $skillName],
                    ['category_id' => $category->id]
                );
            }
        }
    }
}
