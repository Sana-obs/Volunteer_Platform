<?php

namespace Database\Seeders;

use App\Enum\OrganizationStatus;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Participation;
use App\Models\Skill;
use App\Models\User;
use App\Models\Volunteer;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    // عدّل هاد القيم إذا بدك تتحكم بالحجم بسرعة بدون ما تلمس المنطق
    private const ORG_COUNT = 50;
    private const VOLUNTEER_COUNT = 50;
    private const OPPORTUNITIES_PER_GOVERNORATE = 100;

    // فعّل/عطّل ربط صور تجريبية أوفلاين (ما بتحتاج إنترنت، بتتقرأ من database/seeders/images)
    private const SEED_IMAGES = true;

    // عدد الصور المتوفرة بكل مجلد ضمن database/seeders/images (logos / avatars / covers)
    private const IMAGES_PER_TYPE = 12;

    public function run(): void
    {
        $governorates = Governorate::pluck('name_en', 'id'); // [id => name]
        $governorateIds = $governorates->keys()->all();
        $categoryIds = Category::pluck('id')->all();
        $skillIds = Skill::pluck('id')->all();

        if (empty($governorateIds) || empty($categoryIds) || empty($skillIds)) {
            $this->command->warn(
                'يجب تشغيل السيدرز الأساسية أولاً باستخدام php artisan db:seed.'
            );

            return;
        }

        $organizations = $this->seedOrganizations($governorateIds);
        $volunteers = $this->seedVolunteers($governorateIds, $skillIds);
        $opportunities = $this->seedOpportunities(
            $organizations,
            $governorates,
            $categoryIds,
            $skillIds
        );

        $this->seedParticipations($volunteers, $opportunities);

        $this->command->info(
            'تمت تعبئة بيانات العرض: '
            . $organizations->count() . ' منظمات، '
            . $volunteers->count() . ' متطوعين، '
            . $opportunities->count() . ' فرص، '
            . Participation::count() . ' مشاركة.'
        );
    }

    /*
    |--------------------------------------------------------------------
    | Organizations
    |--------------------------------------------------------------------
    */
    private function seedOrganizations(array $governorateIds): Collection
    {
        $orgNames = [
            'Syrian Arab Red Crescent',
            'Syria Trust for Development',
            'Syrian Society for Social Development',
            'Ihsan for Relief and Development',
            'Shafak Organization',
            'Basma Association',
            'Juthour Association',
            'Nama Development Association',
            'Al-Bir and Al-Ihsan Charity Association',
            'Nour Foundation for Relief and Development',
        ];

        $orgDescriptions = [
            'Humanitarian organization supporting communities through relief, emergency response and volunteer initiatives.',
            'Development organization supporting education, community development and local empowerment initiatives.',
            'Organization focused on social development, humanitarian support and community-based programs.',
            'Humanitarian and development organization supporting vulnerable communities and local initiatives.',
            'Humanitarian organization supporting vulnerable communities through relief and volunteer programs.',
            'Community association supporting children, families and local volunteer initiatives.',
            'Organization supporting inclusion, rehabilitation and community care programs.',
            'Development association supporting education, youth and community development initiatives.',
            'Charity association providing social support and community services.',
            'Organization supporting relief, education and community development projects.',
        ];

        $contactPersons = [
            'Ahmad Khalil', 'Sara Hassan', 'Omar Mahmoud', 'Rana Ali', 'Khaled Saleh',
            'Nour Hamdan', 'Maya Ahmad', 'Samer Youssef', 'Lina Qassem', 'Hiba Nasser',
        ];

        return collect(range(0, self::ORG_COUNT - 1))->map(function ($i) use (
            $governorateIds,
            $orgNames,
            $orgDescriptions,
            $contactPersons
        ) {
            if ($i < count($orgNames)) {
                $name = $orgNames[$i];
                $description = $orgDescriptions[$i];
                $contactPerson = $contactPersons[$i];
            } else {
                $name = fake()->company() . ' for ' . fake()->randomElement([
                    'Relief and Development', 'Community Support', 'Education',
                    'Humanitarian Aid', 'Social Development',
                ]);
                $description = fake()->sentence(15);
                $contactPerson = fake()->name();
            }

            $user = User::firstOrCreate(
                ['email' => "org{$i}@demo.test"],
                [
                    'organization_name' => $name,
                    'phone_number' => '09' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                    'password' => 'password123',
                    'email_verified_at' => now(),
                ]
            );

            $user->forceFill([
                'organization_name' => $name,
                'password' => 'password123',
            ])->save();

            $user->assignRole('organization');

            // كل 10 منظمات: 8 Verified، 1 Pending، 1 Rejected (نفس نسبة العينة الأصلية)
            $status = match ($i % 10) {
                8 => OrganizationStatus::Pending,
                9 => OrganizationStatus::Rejected,
                default => OrganizationStatus::Verified,
            };

            $organization = Organization::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $name,
                    'governorate_id' => $governorateIds[$i % count($governorateIds)],
                    'description' => $description,
                    'contact_person' => $contactPerson,
                    'website' => 'https://example.org',
                    'status' => $status,
                    'reviewed_at' => $status === OrganizationStatus::Pending ? null : now(),
                ]
            );

            if (self::SEED_IMAGES) {
                $this->attachImage($organization, 'logo', $this->localImagePath('logos', 'logo', $i));
            }

            return $organization;
        });
    }

    /*
    |--------------------------------------------------------------------
    | Volunteers
    |--------------------------------------------------------------------
    */
    private function seedVolunteers(array $governorateIds, array $skillIds): Collection
    {
        $volunteerNames = [
            ['Ahmad', 'Halabi'], ['Sara', 'Abdullah'], ['Youssef', 'Masri'], ['Lina', 'Shami'],
            ['Karim', 'Najjar'], ['Rahaf', 'Khatib'], ['Mohammad', 'Diab'], ['Nour', 'Hassan'],
            ['Omar', 'Qassem'], ['Yasmin', 'Ahmad'], ['Khaled', 'Saleh'], ['Reem', 'Sheikh'],
            ['Tarek', 'Ali'], ['Heba', 'Zaidan'], ['Samer', 'Youssef'], ['Dima', 'Jundi'],
            ['Wael', 'Hamdan'], ['Maya', 'Shehade'], ['Basel', 'Rifai'], ['Joud', 'Issa'],
            ['Rami', 'Kassem'], ['Layla', 'Homsi'], ['Fadi', 'Nasser'], ['Salma', 'Barakat'],
            ['Ziad', 'Mansour'], ['Hanan', 'Idlibi'], ['Nabil', 'Sarraf'], ['Rana', 'Akkad'],
            ['Hussam', 'Faris'], ['Ola', 'Turkmani'], ['Firas', 'Btaish'], ['Nadia', 'Homsi'],
        ];

        $educationLevels = ['High School', 'Diploma', "Bachelor's Degree"];

        $aboutTexts = [
            'Interested in community service and humanitarian activities.',
            'Active volunteer interested in education and youth initiatives.',
            'Interested in environmental and community development projects.',
            'Enjoys supporting local awareness and social initiatives.',
            'Interested in humanitarian work and supporting vulnerable communities.',
        ];

        return collect(range(0, self::VOLUNTEER_COUNT - 1))->map(function ($i) use (
            $governorateIds,
            $skillIds,
            $educationLevels,
            $aboutTexts,
            $volunteerNames
        ) {
            if ($i < count($volunteerNames)) {
                [$first, $last] = $volunteerNames[$i];
            } else {
                $first = fake()->firstName();
                $last = fake()->lastName();
            }

            $user = User::firstOrCreate(
                ['email' => "volunteer{$i}@demo.test"],
                [
                    'first_name' => $first,
                    'last_name' => $last,
                    'phone_number' => '09' . str_pad($i + 101, 8, '0', STR_PAD_LEFT),
                    'password' => 'password123',
                    'email_verified_at' => now(),
                ]
            );

            $user->forceFill([
                'first_name' => $first,
                'last_name' => $last,
                'password' => 'password123',
            ])->save();

            $user->assignRole('volunteer');

            $volunteer = Volunteer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'gender' => $i % 2 === 0 ? 'male' : 'female',
                    'governorate_id' => $governorateIds[$i % count($governorateIds)],
                    'education_level' => $educationLevels[$i % count($educationLevels)],
                    'birth_date' => Carbon::now()->subYears(20 + ($i % 15))->format('Y-m-d'),
                    'about' => $aboutTexts[$i % count($aboutTexts)],
                ]
            );

            /*
             * Matching test لل volunteer 0:
             * - City: أول محافظة
             * - Skills: Teaching + First Aid
             */
            if ($i === 0) {
                $teachingSkillId = Skill::where('name', 'Teaching')->value('id');
                $firstAidSkillId = Skill::where('name', 'First Aid')->value('id');

                $volunteer->skills()->sync(array_values(array_filter([
                    $teachingSkillId,
                    $firstAidSkillId,
                ])));
            } else {
                $skillCount = min(3, count($skillIds));
                $start = $i % count($skillIds);

                $randomSkills = collect(range(0, $skillCount - 1))
                    ->map(fn ($offset) => $skillIds[($start + $offset) % count($skillIds)])
                    ->all();

                $volunteer->skills()->sync($randomSkills);
            }

            if (self::SEED_IMAGES) {
                $this->attachImage($volunteer, 'avatar', $this->localImagePath('avatars', 'avatar', $i));
            }

            return $volunteer;
        });
    }

    /*
    |--------------------------------------------------------------------
    | Opportunities — 100 لكل محافظة
    |--------------------------------------------------------------------
    */
    private function seedOpportunities(
        Collection $organizations,
        Collection $governorates,
        array $categoryIds,
        array $skillIds
    ): Collection {
        $verifiedOrganizations = $organizations
            ->filter(fn ($organization) => $organization->status === OrganizationStatus::Verified)
            ->values();

        $activityTemplates = [
            'Community Awareness Campaign', 'Emergency Relief Support', 'Youth Empowerment Workshop',
            'Winter Clothes Distribution', 'Food Aid Distribution', 'Health Awareness Event',
            'Tree Planting Campaign', 'Digital Literacy Workshop', 'First Aid Training Workshop',
            'Blood Donation Campaign', 'Ramadan Food Baskets Program', 'Orphan Support Initiative',
            'Public Park Cleanup Campaign', 'Women Empowerment Session', 'Clean Water Initiative',
            'Disability Support Program', 'School Supplies Distribution', 'Community Garden Project',
            'Elderly Assistance Program', 'Educational Support for Children',
        ];

        $allOpportunities = collect();
        $governorateIds = $governorates->keys()->all();
        $globalIndex = 0;

        foreach ($governorateIds as $govPosition => $governorateId) {
            $governorateName = $governorates[$governorateId];

            // أول محافظة بتحمل الفرص الخاصة بسيناريوهات الـ matching test
            if ($govPosition === 0) {
                $allOpportunities = $allOpportunities->merge(
                    $this->seedMatchingTestOpportunities(
                        $verifiedOrganizations,
                        $categoryIds,
                        $skillIds,
                        $governorateId
                    )
                );

                $bulkCount = self::OPPORTUNITIES_PER_GOVERNORATE - 13;
                $completedCount = 43;
                $ongoingCount = 12;
            } else {
                $bulkCount = self::OPPORTUNITIES_PER_GOVERNORATE;
                $completedCount = 50;
                $ongoingCount = 15;
            }

            for ($j = 0; $j < $bulkCount; $j++) {
                $timing = match (true) {
                    $j < $completedCount => 'completed',
                    $j < $completedCount + $ongoingCount => 'ongoing',
                    default => 'open',
                };

                $cycle = intdiv($j, count($activityTemplates)) + 1;
                $template = $activityTemplates[$j % count($activityTemplates)];
                $title = "{$governorateName} - {$template}" . ($cycle > 1 ? " #{$cycle}" : '');

                [$start, $end, $registerStart, $registerEnd] = $this->timingDates($timing, $j);

                $organization = $verifiedOrganizations[$globalIndex % $verifiedOrganizations->count()];

                $skillStart = $globalIndex % count($skillIds);
                $opportunitySkills = collect(range(0, min(1, count($skillIds) - 1)))
                    ->map(fn ($offset) => $skillIds[($skillStart + $offset) % count($skillIds)])
                    ->all();

                $opportunity = Opportunity::updateOrCreate(
                    ['title' => $title],
                    [
                        'organization_id' => $organization->id,
                        'category_id' => $categoryIds[$globalIndex % count($categoryIds)],
                        'governorate_id' => $governorateId,
                        'description' => 'A structured volunteering opportunity designed to support the local community through practical and supervised activities.',
                        'start_date' => $start,
                        'end_date' => $end,
                        'register_start_at' => $registerStart,
                        'register_end_at' => $registerEnd,
                        'min_hours' => 2,
                        'max_hours' => 6 + ($j % 4),
                        'total_hours' => 4 + ($j % 3),
                        'min_volunteers' => 3 + ($j % 3),
                        'max_volunteers' => 15 + ($j % 10),
                        'registration_closed_manually' => false,
                        'is_group' => true,
                    ]
                );

                $opportunity->skills()->sync($opportunitySkills);
                $opportunity->setAttribute('_timing', $timing);

                if (self::SEED_IMAGES) {
                    $this->attachImage($opportunity, 'cover', $this->localImagePath('covers', 'cover', $globalIndex));
                }

                $allOpportunities->push($opportunity);
                $globalIndex++;
            }
        }

        return $allOpportunities;
    }

    /**
     * الفرص الثابتة المستخدمة في سيناريوهات اختبار الـ Naive Bayes matching.
     * منطقها منسوخ حرفيًا عن النسخة الأصلية من السيدر.
     */
    private function seedMatchingTestOpportunities(
        Collection $verifiedOrganizations,
        array $categoryIds,
        array $skillIds,
        int $firstGovernorateId
    ): Collection {
        $opportunityData = [
            ['title' => 'Food Aid Distribution', 'timing' => 'completed', 'match_test' => 'city_and_skills'],
            ['title' => 'Community Awareness Campaign', 'timing' => 'completed', 'match_test' => 'city_only'],
            ['title' => 'Educational Support for Children', 'timing' => 'completed', 'match_test' => 'skills_only'],
            ['title' => 'Public Park Cleanup Campaign', 'timing' => 'completed', 'match_test' => 'no_match'],
            ['title' => 'Winter Clothes Distribution', 'timing' => 'completed', 'match_test' => null],
            ['title' => 'Orphan Support Initiative', 'timing' => 'completed', 'match_test' => null],
            ['title' => 'Tree Planting Campaign', 'timing' => 'completed', 'match_test' => null],
            ['title' => 'Health Awareness Event', 'timing' => 'ongoing', 'match_test' => null],
            ['title' => 'Digital Literacy Workshop', 'timing' => 'ongoing', 'match_test' => null],
            ['title' => 'First Aid Training Workshop', 'timing' => 'ongoing', 'match_test' => null],
            ['title' => 'Elderly Assistance Program', 'timing' => 'open', 'match_test' => null],
            ['title' => 'Blood Donation Campaign', 'timing' => 'open', 'match_test' => null],
            ['title' => 'Ramadan Food Baskets Program', 'timing' => 'open', 'match_test' => null],
        ];

        $governorateIds = [$firstGovernorateId]; // مستخدمة داخل match() تحت، محافظة ثانية بنجيبها بشكل ثابت لو احتجنا
        $allGovernorateIds = Governorate::pluck('id')->all();

        return collect($opportunityData)->map(function ($data, $i) use (
            $verifiedOrganizations,
            $categoryIds,
            $skillIds,
            $firstGovernorateId,
            $allGovernorateIds
        ) {
            $timing = $data['timing'];
            $matchTest = $data['match_test'];

            [$start, $end, $registerStart, $registerEnd] = match ($timing) {
                'completed' => [
                    now()->subDays(25 - ($i * 2)),
                    now()->subDays(23 - ($i * 2)),
                    now()->subDays(40 - ($i * 2)),
                    now()->subDays(27 - ($i * 2)),
                ],
                'ongoing' => [
                    now()->subHours(2 + ($i * 2)),
                    now()->addHours(4 + $i),
                    now()->subDays(12),
                    now()->subDay(),
                ],
                'open' => [
                    now()->addDays(8 + $i),
                    now()->addDays(10 + $i),
                    now()->subDays(2),
                    now()->addDays(6 + $i),
                ],
            };

            $organization = $verifiedOrganizations[$i % $verifiedOrganizations->count()];

            // Opportunity #10 (أول فرصة open) مطابقة مباشرة للـ volunteer 0
            if ($i === 10) {
                $governorateId = $firstGovernorateId;

                $teachingSkillId = Skill::where('name', 'Teaching')->value('id');
                $firstAidSkillId = Skill::where('name', 'First Aid')->value('id');

                $opportunitySkills = array_values(array_filter([
                    $teachingSkillId,
                    $firstAidSkillId,
                ]));
            } else {
                $governorateId = match ($matchTest) {
                    'city_and_skills', 'city_only' => $firstGovernorateId,
                    'skills_only', 'no_match' => $allGovernorateIds[1 % count($allGovernorateIds)],
                    default => $allGovernorateIds[$i % count($allGovernorateIds)],
                };

                $opportunitySkills = match ($matchTest) {
                    'city_and_skills', 'skills_only' => [$skillIds[0], $skillIds[1]],
                    'city_only', 'no_match' => [
                        $skillIds[3 % count($skillIds)],
                        $skillIds[4 % count($skillIds)],
                    ],
                    default => collect(range(0, min(1, count($skillIds) - 1)))
                        ->map(fn ($offset) => $skillIds[($i + $offset) % count($skillIds)])
                        ->all(),
                };
            }

            $opportunity = Opportunity::updateOrCreate(
                ['title' => $data['title']],
                [
                    'organization_id' => $organization->id,
                    'category_id' => $categoryIds[$i % count($categoryIds)],
                    'governorate_id' => $governorateId,
                    'description' => 'A structured volunteering opportunity designed to support the local community through practical and supervised activities.',
                    'start_date' => $start,
                    'end_date' => $end,
                    'register_start_at' => $registerStart,
                    'register_end_at' => $registerEnd,
                    'min_hours' => 2,
                    'max_hours' => 6,
                    'total_hours' => 4,
                    'min_volunteers' => 3,
                    'max_volunteers' => 15,
                    'registration_closed_manually' => false,
                    'is_group' => true,
                ]
            );

            $opportunity->skills()->sync($opportunitySkills);
            $opportunity->setAttribute('_timing', $timing);

            if (self::SEED_IMAGES) {
                $this->attachImage($opportunity, 'cover', $this->localImagePath('covers', 'cover', $i));
            }

            return $opportunity;
        });
    }

    private function timingDates(string $timing, int $j): array
    {
        return match ($timing) {
            'completed' => [
                now()->subDays(30 + ($j % 60)),
                now()->subDays(28 + ($j % 60)),
                now()->subDays(45 + ($j % 60)),
                now()->subDays(32 + ($j % 60)),
            ],
            'ongoing' => [
                now()->subHours(2 + ($j % 10)),
                now()->addHours(4 + ($j % 10)),
                now()->subDays(12),
                now()->subDay(),
            ],
            'open' => [
                now()->addDays(8 + ($j % 20)),
                now()->addDays(10 + ($j % 20)),
                now()->subDays(2),
                now()->addDays(6 + ($j % 20)),
            ],
        };
    }

    /*
    |--------------------------------------------------------------------
    | Participations — مبنية بشكل ديناميكي بدل indexes ثابتة
    | (ضروري لأنو عدد الفرص صار كبير ومتغيّر حسب عدد المحافظات)
    |--------------------------------------------------------------------
    */
    private function seedParticipations(Collection $volunteers, Collection $opportunities): void
    {
        $completed = $opportunities->filter(fn ($o) => $o->_timing === 'completed')->values();
        $ongoing = $opportunities->filter(fn ($o) => $o->_timing === 'ongoing')->values();
        $open = $opportunities->filter(fn ($o) => $o->_timing === 'open')->values();

        foreach ($completed as $opportunity) {
            $participants = $volunteers->random(min(4, $volunteers->count()));

            foreach ($participants as $participantIndex => $volunteer) {
                Participation::updateOrCreate(
                    [
                        'opportunity_id' => $opportunity->id,
                        'volunteer_id' => $volunteer->user_id,
                    ],
                    [
                        'status' => 'accepted',
                        'committed_hours' => $participantIndex === 0 ? 4 : 3,
                        'hours_logged' => $participantIndex === 0 ? 4 : 2 + ($participantIndex % 3),
                        'participated_at' => $opportunity->start_date,
                    ]
                );
            }
        }

        // سيناريوهات withdrawn / rejected ثابتة، مربوطة بعنوان الفرصة مو بالـ index
        $this->attachFixedScenario(
            $completed->firstWhere('title', 'Community Awareness Campaign'),
            $volunteers->get(10),
            'withdrawn'
        );

        $this->attachFixedScenario(
            $completed->firstWhere('title', 'Educational Support for Children'),
            $volunteers->get(20),
            'rejected'
        );

        foreach ($ongoing as $opportunity) {
            $accepted = $volunteers->random(min(3, $volunteers->count()));

            foreach ($accepted as $volunteer) {
                Participation::updateOrCreate(
                    [
                        'opportunity_id' => $opportunity->id,
                        'volunteer_id' => $volunteer->user_id,
                    ],
                    [
                        'status' => 'accepted',
                        'committed_hours' => 4,
                        'hours_logged' => null,
                        'participated_at' => now()->subHours(1),
                    ]
                );
            }

            $pending = $volunteers->diff($accepted)->random(1)->first();

            Participation::updateOrCreate(
                [
                    'opportunity_id' => $opportunity->id,
                    'volunteer_id' => $pending->user_id,
                ],
                [
                    'status' => 'pending',
                    'committed_hours' => 3,
                    'hours_logged' => null,
                    'participated_at' => null,
                ]
            );
        }

        if ($ongoing->isNotEmpty()) {
            $this->attachFixedScenario($ongoing->first(), $volunteers->get(25), 'withdrawn', now());
        }

        foreach ($open as $opportunity) {
            $picked = $volunteers->random(min(4, $volunteers->count()));
            [$pendingOne, $pendingTwo, $accepted, $rejected] = [
                $picked->get(0), $picked->get(1), $picked->get(2), $picked->get(3),
            ];

            foreach ([$pendingOne, $pendingTwo] as $volunteer) {
                if (! $volunteer) {
                    continue;
                }

                Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteer->user_id],
                    ['status' => 'pending', 'committed_hours' => 3, 'hours_logged' => null, 'participated_at' => null]
                );
            }

            if ($accepted) {
                Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $accepted->user_id],
                    ['status' => 'accepted', 'committed_hours' => 3, 'hours_logged' => null, 'participated_at' => null]
                );
            }

            if ($rejected) {
                Participation::updateOrCreate(
                    ['opportunity_id' => $opportunity->id, 'volunteer_id' => $rejected->user_id],
                    [
                        'status' => 'rejected',
                        'committed_hours' => 3,
                        'hours_logged' => null,
                        'rejection_reason' => 'The volunteer limit was reached before the request was reviewed.',
                        'participated_at' => null,
                    ]
                );
            }
        }
    }

    private function attachFixedScenario($opportunity, $volunteer, string $status, ?Carbon $reference = null): void
    {
        if (! $opportunity || ! $volunteer) {
            return;
        }

        $data = [
            'status' => $status,
            'committed_hours' => $status === 'withdrawn' ? 3 : 3,
            'hours_logged' => null,
            'participated_at' => null,
        ];

        if ($status === 'withdrawn') {
            $base = $reference ?? $opportunity->start_date;
            $data['withdrawn_date'] = $base->copy()->subDays(2)->toDateString();
        }

        if ($status === 'rejected') {
            $data['rejection_reason'] = 'The volunteer limit was reached before the request was reviewed.';
        }

        Participation::updateOrCreate(
            ['opportunity_id' => $opportunity->id, 'volunteer_id' => $volunteer->user_id],
            $data
        );
    }

    /*
    |--------------------------------------------------------------------
    | Spatie MediaLibrary — ربط صورة تجريبية أوفلاين من database/seeders/images
    |--------------------------------------------------------------------
    */

    /**
     * بيحسب مسار صورة محلية بالدوران على IMAGES_PER_TYPE صورة متوفرة،
     * مثلاً: database/seeders/images/logos/logo3.png
     */
    private function localImagePath(string $folder, string $prefix, int $index): string
    {
        $number = ($index % self::IMAGES_PER_TYPE) + 1;

        return database_path("seeders/images/{$folder}/{$prefix}{$number}.png");
    }

    private function attachImage($model, string $collection, string $path): void
    {
        if ($model->getMedia($collection)->isNotEmpty()) {
            return; // ما نكرر الربط بإعادة التشغيل
        }

        if (! file_exists($path)) {
            $this->command->warn("الصورة غير موجودة: {$path}");

            return;
        }

        try {
            // preservingOriginal() ضروري: addMedia() بيحذف الملف المصدر افتراضيًا،
            // وإحنا عم نعيد استخدام نفس 12 صورة قالب لعشرات السجلات.
            $model->addMedia($path)
                ->preservingOriginal()
                ->toMediaCollection($collection);
        } catch (\Throwable $e) {
            $this->command->warn("تعذّر ربط صورة {$collection} لـ " . get_class($model) . " #{$model->id}: " . $e->getMessage());
        }
    }
}
