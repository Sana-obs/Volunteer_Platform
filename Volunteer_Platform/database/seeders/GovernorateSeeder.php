<?php

namespace Database\Seeders;

use App\Models\Governorate;
use Illuminate\Database\Seeder;

class GovernorateSeeder extends Seeder
{
    public function run(): void
    {
        $governorates = [
            ['name_en' => 'Damascus',        'name_ar' => 'دمشق'],
            ['name_en' => 'Rif Dimashq',     'name_ar' => 'ريف دمشق'],
            ['name_en' => 'Aleppo',          'name_ar' => 'حلب'],
            ['name_en' => 'Homs',            'name_ar' => 'حمص'],
            ['name_en' => 'Hama',            'name_ar' => 'حماة'],
            ['name_en' => 'Latakia',         'name_ar' => 'اللاذقية'],
            ['name_en' => 'Tartus',          'name_ar' => 'طرطوس'],
            ['name_en' => 'Idlib',           'name_ar' => 'إدلب'],
            ['name_en' => 'Raqqa',           'name_ar' => 'الرقة'],
            ['name_en' => 'Deir ez-Zor',     'name_ar' => 'دير الزور'],
            ['name_en' => 'Hasakah',         'name_ar' => 'الحسكة'],
            ['name_en' => 'Daraa',           'name_ar' => 'درعا'],
            ['name_en' => 'Sweida',          'name_ar' => 'السويداء'],
            ['name_en' => 'Quneitra',        'name_ar' => 'القنيطرة'],
        ];

        foreach ($governorates as $governorate) {
            Governorate::firstOrCreate(
                ['name_en' => $governorate['name_en']],
                ['name_ar' => $governorate['name_ar'], 'is_active' => true]
            );
        }
    }
}
