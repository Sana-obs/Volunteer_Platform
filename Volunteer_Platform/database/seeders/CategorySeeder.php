<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Education',
                'description' => 'Volunteering opportunities focused on teaching, tutoring, and educational support for children and students of various age groups, including academic subjects, literacy, and skill-building programs.',
            ],
            [
                'name' => 'Health',
                'description' => 'Volunteering opportunities related to medical support, health awareness campaigns, first aid, psychological support, and initiatives that promote physical and mental well-being in communities.',
            ],
            [
                'name' => 'Environment',
                'description' => 'Volunteering opportunities aimed at environmental conservation, sustainability, tree planting, waste reduction, renewable energy, and raising awareness about climate change and biodiversity.',
            ],
            [
                'name' => 'Social',
                'description' => 'Volunteering opportunities that support vulnerable groups such as orphans, the elderly, refugees, and low-income families through relief programs, social services, and community support initiatives.',
            ],
            [
                'name' => 'Technical',
                'description' => 'Volunteering opportunities involving technology, software development, data management, and digital tools to support charitable organizations and improve their operations and outreach.',
            ],
            [
                'name' => 'Sports',
                'description' => 'Volunteering opportunities centered on sports training, physical fitness programs, and athletic events aimed at promoting health, teamwork, and active lifestyles within the community.',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
